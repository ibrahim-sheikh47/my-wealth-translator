// ConditionalLayout.jsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuth();
  const { plan } = useSelector((state) => state.userProfile);

  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/splash';
  const isPaymentPage = pathname === '/payment';
  const isPaymentSuccessPage = pathname?.startsWith('/payment/success');

  useEffect(() => {
    if (isInitialized && user && plan === 'free' && !isPaymentPage && !isPaymentSuccessPage && !isAuthPage) {
      router.replace('/payment');
    }

    // ✅ FIX: Redirect unauthenticated users to /splash instead of blank screen
    if (isInitialized && !user && !isAuthPage) {
      router.replace('/splash');
    }
  }, [isInitialized, user, plan, isPaymentPage, isPaymentSuccessPage, isAuthPage, router]);

  // ✅ Skip spinner on auth/payment pages
  if ((!isInitialized || isLoading) && !isAuthPage && !isPaymentPage) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#c7a481]"></div>
      </div>
    );
  }

  if (isAuthPage || isPaymentPage) {
    return <>{children}</>;
  }

  // ✅ Return null while redirect is pending (no flash)
  if (isInitialized && user && plan === 'free' && !isPaymentSuccessPage) {
    return null;
  }

  // ✅ Return null while redirecting to /splash (spinner above handles the wait)
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