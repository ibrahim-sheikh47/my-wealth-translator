// app/payment/page.jsx — FULL STRIPE INTEGRATION
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/app/hooks/useAuth';

// ─── Stripe Price IDs (replace with your actual Stripe Price IDs) ────────────
// Get these from Stripe Dashboard → Products → Prices
const STRIPE_PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_1ABC123', // Replace
  annual:  process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID  || 'price_1ABC456', // Replace
};

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: 29,
    period: '/month',
    billingCycle: 'monthly',
    stripePrice: STRIPE_PRICE_IDS.monthly,
    features: [
      'Unlimited cost of living calculations',
      'Retirement planning & analysis',
      'Stock plan tax calculator',
      'Income & savings projections',
      'Export all reports to CSV',
      'Save unlimited scenarios',
      'Priority email support',
    ],
    popular: false,
    icon: Zap,
    color: '#c7a481',
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    price: 290,
    period: '/year',
    billingCycle: 'annual',
    stripePrice: STRIPE_PRICE_IDS.annual,
    savings: 'Save $58',
    features: [
      'Everything in Monthly Pro',
      '2 months free (16% off)',
      'Advanced tax optimization tips',
      'Priority phone support',
      'Early access to new features',
      'Dedicated account manager',
    ],
    popular: true,
    icon: Crown,
    color: '#8b1c1c',
  },
];

export default function PaymentFirewall() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!user?.uid) {
      setError('Please log in first.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const plan = PLANS.find((p) => p.id === selectedPlan);

      // Call API route to create Stripe Checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId:      plan.stripePrice,
          userId:       user.uid,
          plan:         'pro',
          billingCycle: plan.billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="Wealth Logo"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Welcome to <span style={{ color: '#c7a481' }}>Wealth Translator</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose your plan to unlock all features and start translating your
            financial future today.
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
                    ? 'border-[#c7a481] bg-[#2a2a2a]'
                    : 'border-[#3a3a3a] bg-[#1f1f1f] hover:border-[#4a4a4a]'
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
                  style={{ backgroundColor: isSelected ? plan.color : '#2a2a2a' }}
                >
                  <Icon size={24} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-extrabold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-lg text-gray-400">{plan.period}</span>
                </div>

                {plan.savings && (
                  <p className="text-sm font-semibold mb-4" style={{ color: '#7ec87e' }}>
                    {plan.savings}
                  </p>
                )}

                <ul className="space-y-3 mt-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check size={16} className="text-[#c7a481] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

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
          style={{ backgroundColor: '#8b1c1c' }}
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            `Subscribe to ${PLANS.find((p) => p.id === selectedPlan)?.name}`
          )}
        </button>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
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