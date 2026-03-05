// app/payment/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Crown, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// ─── Stripe Price IDs ─────────────────────────────────────────────────────────
const STRIPE_PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "price_1ABC123",
  annual: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || "price_1ABC456",
};

const PLANS = [
  {
    id: "monthly",
    name: "Monthly Pro",
    price: 29,
    period: "/month",
    billingCycle: "monthly",
    stripePrice: STRIPE_PRICE_IDS.monthly,
    popular: false,
    icon: Zap,
    color: "#c7a481",
  },
  {
    id: "annual",
    name: "Annual Pro",
    price: 290,
    period: "/year",
    billingCycle: "annual",
    stripePrice: STRIPE_PRICE_IDS.annual,
    savings: "Save $58",
    popular: true,
    icon: Crown,
    color: "#8b1c1c",
  },
];

export default function PaymentFirewall() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // ── Detect returning expired subscriber ───────────────────────────────────
  const [wasEverPro, setWasEverPro] = useState(false);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setUserChecked(true);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          // Derive from subscriptionId or paymentStatus — no extra field needed
          setWasEverPro(!!(d.subscriptionId || d.paymentStatus));
        }
      } catch (_) {
        // fail silently — just show generic messaging
      } finally {
        setUserChecked(true);
      }
    })();
  }, [user]);

  const handleSubscribe = async () => {
    if (!user?.uid) {
      setError("Please log in first.");
      return;
    }
    setIsProcessing(true);
    setError("");
    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripePrice,
          userId: user.uid,
          plan: "pro",
          billingCycle: plan.billingCycle,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create checkout session");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // ── Copy variants ─────────────────────────────────────────────────────────
  const heading = wasEverPro ? "Welcome back" : "Welcome to Wealth Translator";

  const subheading = wasEverPro
    ? "Your Pro subscription has ended. Renew now to pick up right where you left off — all your saved reports and data are still here."
    : "Choose your plan to unlock all features and start translating your financial future today.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Image
            src="/logo.png"
            alt="Wealth Logo"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />

          {/* Expired banner — only for returning Pro users */}
          {userChecked && wasEverPro && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-5"
              style={{
                backgroundColor: "rgba(139,28,28,0.15)",
                border: "1px solid rgba(139,28,28,0.35)",
                color: "#f87171",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              Your subscription has expired
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            {
              userChecked ? (
                wasEverPro ? (
                  <>
                    <span style={{ color: "#c7a481" }}>Welcome back</span>
                  </>
                ) : (
                  <>
                    Welcome to{" "}
                    <span style={{ color: "#c7a481" }}>Wealth Translator</span>
                  </>
                )
              ) : (
                <span className="opacity-0">Loading</span>
              ) /* prevent layout shift */
            }
          </h1>

          <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {userChecked ? subheading : ""}
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                disabled={isProcessing}
                className={`relative p-8 rounded-2xl border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? "border-[#c7a481] bg-[#2a2a2a]"
                    : "border-[#3a3a3a] bg-[#1f1f1f] hover:border-[#4a4a4a]"
                }`}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                    style={{ backgroundColor: plan.color }}
                  >
                    <Sparkles size={12} />
                    Most Popular
                  </div>
                )}

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: isSelected ? plan.color : "#2a2a2a",
                  }}
                >
                  <Icon size={24} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-extrabold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-lg text-gray-400">{plan.period}</span>
                </div>

                {plan.savings && (
                  <p
                    className="text-sm font-semibold mb-4"
                    style={{ color: "#7ec87e" }}
                  >
                    {plan.savings}
                  </p>
                )}

                {isSelected && (
                  <div
                    className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: plan.color }}
                  >
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={isProcessing}
          className="w-full py-5 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: "#8b1c1c" }}
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Redirecting to
              checkout...
            </>
          ) : wasEverPro ? (
            `Renew ${PLANS.find((p) => p.id === selectedPlan)?.name}`
          ) : (
            `Subscribe to ${PLANS.find((p) => p.id === selectedPlan)?.name}`
          )}
        </button>

        {/* Returning user reassurance */}
        {userChecked && wasEverPro && (
          <p className="text-center text-xs text-zinc-500 mt-4">
            Your saved reports, scenarios, and preferences are waiting —
            renewing restores full access instantly.
          </p>
        )}

        {/* Trust indicators */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>🔒</span>
            <span>Secure payment by Stripe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>✓</span>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>💳</span>
            <span>All cards accepted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
