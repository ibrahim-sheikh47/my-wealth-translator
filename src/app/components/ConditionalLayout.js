'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Don't show sidebar on auth pages or splash
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/splash';

  // Show nothing while loading to prevent flash
  if (loading) {
    return null;
  }

  // Don't show main layout on auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Only show main app layout if user is authenticated
  if (!user) {
    return null; // Will redirect in AuthContext
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      <Sidebar />
      <main className="flex-1 pb-20 lg:pb-0 lg:ml-0">
        {children}
      </main>
    </div>
  );
}