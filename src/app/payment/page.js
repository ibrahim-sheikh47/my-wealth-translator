"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

const PLAN = {
  id: "annual",
  name: "Annual Subscription",
  price: 1.99,
  period: "/year",
  billingCycle: "annual",
  stripePrice: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID,
};

const FEATURES = [
  "Retirement planning calculator",
  "Income analysis tools",
  "Cost of living reports",
  "Amortization calculator",
  "Save & export reports",
];

export default function PaymentFirewall() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [wasEverPro, setWasEverPro] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    if (!user?.uid) { setUserChecked(true); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setWasEverPro(!!(d.subscriptionId || d.paymentStatus));
        }
      } catch (_) {}
      finally { setUserChecked(true); }
    })();
  }, [user]);

  const handleSubscribe = async () => {
    if (!user?.uid) { setError("Please log in first."); return; }
    setIsProcessing(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: PLAN.stripePrice,
          userId: user.uid,
          plan: "pro",
          billingCycle: PLAN.billingCycle,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-12">
      <div className="w-full max-w-2xl ">

        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Wealth Logo" width={80} height={80} className="mx-auto mb-6" />

          {userChecked && wasEverPro && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-5"
              style={{ backgroundColor: "rgba(139,28,28,0.15)", border: "1px solid rgba(139,28,28,0.35)", color: "#f87171" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              Your subscription has expired
            </div>
          )}

          <h1 className="text-4xl font-extrabold text-white mb-3">
            {userChecked ? (
              wasEverPro ? (
                <span style={{ color: "#c7a481" }}>Welcome back</span>
              ) : (
                <>Welcome to <span style={{ color: "#c7a481" }}>Wealth Translator</span></>
              )
            ) : <span className="opacity-0">Loading</span>}
          </h1>

          <p className="text-gray-400 text-sm">
            {userChecked ? (
              wasEverPro
                ? "Renew now to pick up right where you left off — all your saved data is still here."
                : "Get full access to all financial tools for less than a coffee."
            ) : ""}
          </p>
        </div>

        {/* Plan Card */}
        <div
          className="rounded-2xl p-8 mb-6 border-2"
          style={{ backgroundColor: "#2a2a2a", borderColor: "#c7a481" }}
        >
          {/* Badge */}
          <div className="flex justify-between items-start mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#8b1c1c" }}
            >
              <Crown size={24} className="text-white" />
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(199,164,129,0.15)", color: "#c7a481" }}
            >
              BEST VALUE
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{PLAN.name}</h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-6xl font-extrabold text-white">${PLAN.price}</span>
            <span className="text-gray-400">{PLAN.period}</span>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(199,164,129,0.15)" }}
                >
                  <Check size={12} style={{ color: "#c7a481" }} />
                </div>
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Selected indicator */}
          <div
            className="w-full py-2 rounded-xl text-center text-xs font-semibold"
            style={{ backgroundColor: "rgba(199,164,129,0.1)", color: "#c7a481" }}
          >
            ✓ Selected
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleSubscribe}
          disabled={isProcessing}
          className="w-full py-5 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: "#8b1c1c" }}
        >
          {isProcessing ? (
            <><Loader2 size={20} className="animate-spin" /> Redirecting to checkout...</>
          ) : wasEverPro ? "Renew Annual Subscription — $1.99/yr" : "Get Annual Subscription — $1.99/yr"}
        </button>

        {wasEverPro && (
          <p className="text-center text-xs text-zinc-500 mt-3">
            Your saved reports and data are waiting — renewing restores full access instantly.
          </p>
        )}

        {/* Trust indicators */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><span>🔒</span><span>Secured by Stripe</span></div>
          <div className="flex items-center gap-1.5"><span>💳</span><span>All cards accepted</span></div>
        </div>

      </div>
    </div>
  );
}