// app/payment/success/page.jsx
'use client';

// ✅ FIX 1: Suspense MUST be imported at the top before it's used.
// Having it at the bottom caused the component to crash silently,
// which triggered middleware to redirect back to /payment.
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
  // ✅ FIX 2: Guard against the useEffect running twice in React StrictMode
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
        // ✅ FIX 3: Retry up to 8 times (every 2s = up to 16s total) instead
        // of a single 2s delay. Webhooks are async and can take varying time.
        // We poll Firestore until plan === 'pro' is confirmed.
        const MAX_ATTEMPTS = 8;
        const RETRY_DELAY  = 2000;
        let verified = false;
        let result = null;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          // Wait before each check (first attempt still waits 2s for webhook)
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

          result = await dispatch(
            fetchSubscriptionStatus(user.uid)
          ).unwrap();

          console.log(`[v0] Attempt ${attempt}/${MAX_ATTEMPTS}: Current plan = '${result?.plan}'`);

          if (result?.plan === 'pro') {
            verified = true;
            break;
          }
        }

        if (!verified) {
          throw new Error('Subscription not confirmed after maximum retries.');
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
        console.error('[v0] Payment verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]); // Only re-run if the user changes, not on every render

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
              you were charged.
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

// ✅ Suspense wraps the inner component because useSearchParams()
// requires it in Next.js App Router.
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
