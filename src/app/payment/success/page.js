// app/payment/success/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { clearNeedsPayment } from '@/app/store/slices/authSlice';
import { fetchSubscriptionStatus } from '@/app/store/slices/userProfileSlice';
import { useAuth } from '@/app/hooks/useAuth';

function PaymentSuccessInner() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId || !user?.uid) {
      setStatus('error');
      return;
    }

  const verifyPayment = async () => {
  try {
    // 1. Give the webhook 2 seconds to finish the Firestore update
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Fetch the latest profile directly from Firestore
    // This ensures your Redux state 'user.plan' becomes 'pro'
    await dispatch(fetchSubscriptionStatus(user.uid)).unwrap();

    // 3. Clear the UI block flags
    dispatch(clearNeedsPayment());

    setStatus('success');

    // 4. Force a hard redirect to home to reset all route guards
    setTimeout(() => {
      window.location.href = '/'; // Use window.location for a "hard" reset of the app state
    }, 2500);
  } catch (error) {
    console.error('Payment verification error:', error);
    setStatus('error');
  }
};
    verifyPayment();
  }, [searchParams, user, dispatch, router]);

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
              We couldn't verify your payment. Please contact support.
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

// Need Suspense import
import { Suspense } from 'react';