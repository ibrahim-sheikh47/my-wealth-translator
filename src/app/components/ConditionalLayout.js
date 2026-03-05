"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuth();
  const { plan } = useSelector((state) => state.userProfile);

  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/splash";
  const isPaymentPage = pathname === "/payment";
  const isPaymentSuccessPage = pathname?.startsWith("/payment/success");

  // ── Subscription expiry state ──────────────────────────────────────────────
  const [subStatus, setSubStatus] = useState("loading"); // 'loading' | 'active' | 'expired'
  const [wasEverPro, setWasEverPro] = useState(false); // true if user previously had a paid plan

  useEffect(() => {
    // Only check subscription for authenticated, non-auth-page users
    if (!isInitialized || !user || isAuthPage) return;

    async function checkSubscription() {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) {
          setSubStatus("active");
          return;
        }

        const data = snap.data();
        // planExpiresAt is stored as an ISO string by the webhook e.g. "2026-01-05T22:20:06.207Z"
        const planExpiresAt = data.planExpiresAt ?? null;
        // Derive wasEverPro from subscriptionId or paymentStatus existing — no extra field needed
        const hadPro = !!(data.subscriptionId || data.paymentStatus);
        setWasEverPro(hadPro);

        if (!planExpiresAt) {
          // No expiry set — treat as active
          setSubStatus("active");
          return;
        }

        const expiryMs = new Date(planExpiresAt).getTime();
        const now = Date.now();

        console.log("[ConditionalLayout] expiry check:", {
          planExpiresAt,
          expiryMs,
          now,
          expired: now > expiryMs,
        });

        setSubStatus(now > expiryMs ? "expired" : "active");
      } catch (err) {
        console.error("[ConditionalLayout] subscription check failed:", err);
        setSubStatus("active"); // fail open — don't lock out users on error
      }
    }

    checkSubscription();
  }, [isInitialized, user, isAuthPage]);

  // ── Redirect logic ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;

    // Unauthenticated → splash
    if (!user && !isAuthPage) {
      router.replace("/splash");
      return;
    }

    // Free plan (never subscribed) → payment
    if (
      user &&
      plan === "free" &&
      !isPaymentPage &&
      !isPaymentSuccessPage &&
      !isAuthPage
    ) {
      router.replace("/payment");
      return;
    }

    // Expired subscription → payment (only after expiry check resolves)
    if (
      user &&
      plan !== "free" &&
      subStatus === "expired" &&
      !isPaymentPage &&
      !isPaymentSuccessPage &&
      !isAuthPage
    ) {
      router.replace("/payment");
    }
  }, [
    isInitialized,
    user,
    plan,
    subStatus,
    isPaymentPage,
    isPaymentSuccessPage,
    isAuthPage,
    router,
  ]);

  // ── Loading states ─────────────────────────────────────────────────────────
  if ((!isInitialized || isLoading) && !isAuthPage && !isPaymentPage) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#c7a481]" />
      </div>
    );
  }

  if (isAuthPage || isPaymentPage) return <>{children}</>;

  // Suppress flash while redirecting free users
  if (isInitialized && user && plan === "free" && !isPaymentSuccessPage)
    return null;

  // Suppress flash while redirecting to splash
  if (!user) return null;

  // Suppress flash while sub check is still in-flight (only for pro users)
  if (plan !== "free" && subStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#c7a481]" />
      </div>
    );
  }

  // Suppress flash while redirecting expired users
  if (plan !== "free" && subStatus === "expired" && !isPaymentSuccessPage)
    return null;

  // ── Expired subscription interstitial ──────────────────────────────────────
  // Shown briefly before redirect fires — gives context instead of a blank flash.
  // Only shown to users who were previously Pro (returning subscribers).
  // First-time free users are redirected silently with no message.
  if (subStatus === "expired" && wasEverPro) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2"
            style={{
              backgroundColor: "rgba(199,164,129,0.12)",
              border: "1px solid rgba(199,164,129,0.25)",
            }}
          >
            <span className="text-2xl">🔓</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Your subscription has ended
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your Pro access expired. Renew to pick up right where you left off —
            your saved reports and data are still here waiting for you.
          </p>
          <button
            onClick={() => router.replace("/payment")}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#8b1c1c" }}
          >
            Renew My Plan
          </button>
        </div>
      </div>
    );
  }

  // ── Normal layout ──────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#1a1a1a" }}>
      <Sidebar />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
    </div>
  );
}
