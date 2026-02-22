'use client';

import { usePathname, useRouter } from 'next/navigation'; // Add useRouter here
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter(); // Initialize the router
  const { user, isInitialized, isLoading } = useAuth(); // Use isLoading to match Redux
  const { plan } = useSelector((state) => state.userProfile);

  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/splash';
  const isPaymentPage = pathname === '/payment';
  const isPaymentSuccessPage = pathname?.startsWith('/payment/success');

  // The Logic: If logged in but on free plan, force to payment
  // BUT: Don't redirect if on payment success page (allow verification to complete)
  useEffect(() => {
    if (isInitialized && user && plan === 'free' && !isPaymentPage && !isPaymentSuccessPage && !isAuthPage) {
      router.replace('/payment');
    }
  }, [isInitialized, user, plan, isPaymentPage, isPaymentSuccessPage, isAuthPage, router]);

  // Prevent flash by showing a loader while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#c7a481]"></div>
      </div>
    );
  }

  if (isAuthPage || isPaymentPage) {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <Sidebar />
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
