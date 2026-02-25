// app/payment/success/page.jsx
'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { clearNeedsPayment } from '@/app/store/slices/authSlice';
import { fetchSubscriptionStatus, setPlan } from '@/app/store/slices/userProfileSlice';
import { useAuth } from '@/app/hooks/useAuth';

function PaymentSuccessInner() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const userPlan = useSelector((state) => state.userProfile?.plan);
  const [status, setStatus] = useState('loading');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const sessionId = searchParams.get('session_id');
    if (!sessionId || !user?.uid) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        // ✅ FIX 3: Longer initial delay for webhook processing
        // Stripe webhooks can take 3-5 seconds to fire and update Firestore
        const INITIAL_WEBHOOK_DELAY = 5000; // 5 seconds
        const MAX_ATTEMPTS = 8;
        const RETRY_DELAY = 2000;
        let verified = false;
        let result = null;

        console.log('[PaymentSuccess] Waiting for webhook to process...');
        await new Promise((resolve) => setTimeout(resolve, INITIAL_WEBHOOK_DELAY));

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          console.log(`[PaymentSuccess] Polling attempt ${attempt}/${MAX_ATTEMPTS}...`);

          result = await dispatch(
            fetchSubscriptionStatus(user.uid)
          ).unwrap();

          console.log(`[PaymentSuccess] Attempt ${attempt}/${MAX_ATTEMPTS}: Current plan = '${result?.plan}'`);

          // ✅ Check for both 'pro' and 'enterprise'
          if (result?.plan === 'pro' || result?.plan === 'enterprise') {
            verified = true;
            console.log('[PaymentSuccess] ✅ Subscription verified!', result);
            break;
          }

          // Only wait between retries, not after the final attempt
          if (attempt < MAX_ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          }
        }

        if (!verified) {
          throw new Error(`Subscription not confirmed after ${MAX_ATTEMPTS} retries. Last result: ${JSON.stringify(result)}`);
        }

        // ✅ Update Redux state to reflect the new pro plan
        if (result) {
          dispatch(setPlan(result));
        }

        // ✅ Clear the payment gate flag in Redux
        dispatch(clearNeedsPayment());
        setStatus('success');

        // Hard redirect resets all Redux/route guard state cleanly
        setTimeout(() => {
          window.location.href = '/';
        }, 2500);
      } catch (error) {
        console.error('[PaymentSuccess] Payment verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4">
      <div className="w-full max-w-md text-center">
        <Image
          src="/logo.png"
          alt="Wealth Logo"
          width={80}
          height={80}
          className="mx-auto mb-8"
        />

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} className="text-[#c7a481] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verifying Payment...
            </h1>
            <p className="text-gray-400">
              Please wait while we confirm your subscription.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#7ec87e' }}
            >
              <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-400 mb-4">
              Your subscription is now active.
            </p>
            <p className="text-sm text-[#c7a481]">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#8b1c1c' }}
            >
              <span className="text-white text-2xl">✕</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Verification Failed
            </h1>
            <p className="text-gray-400 mb-6">
              We couldn&apos;t verify your payment. Please contact support if
              you were charged. Your payment may still be processing.
            </p>
            <button
              onClick={() => router.push('/payment')}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#8b1c1c' }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}