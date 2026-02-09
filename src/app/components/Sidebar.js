'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, DollarSign, PiggyBank, TrendingUp, Wallet, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Living', href: '/living', icon: DollarSign },
  { name: 'Retirement', href: '/retirement', icon: PiggyBank },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
  { name: 'Income', href: '/income', icon: Wallet },
];

// Ultra-fast motion config
const fast = {
  duration: 0.14,
  ease: 'easeOut',
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ================= Desktop Sidebar ================= */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="flex flex-col flex-1 overflow-y-auto">

          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-[#2a2a2a]">
            <h1 className="text-2xl font-bold text-[#c7a481]">Wealth Translator</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.name} href={item.href} className="block">
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={fast}
                    className={`
                      relative flex items-center gap-4 px-4 py-3 rounded-xl
                      ${isActive ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}
                    `}
                  >
                    {/* Active indicator (layout-only = FAST) */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-[rgba(199,164,129,0.18)]"
                        transition={fast}
                      />
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-4">
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={2}
                        style={{ color: isActive ? '#c7a481' : undefined }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom CTA */}
          <div className="p-4 border-t border-[#2a2a2a]">
            <motion.div whileTap={{ scale: 0.96 }} transition={fast}>
              <div
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-xl bg-[#751312]"
              >
              {/* logout icon here */}
                <LogOut className="w-4 h-4" />
                Logout
              </div>
            </motion.div>
          </div>
        </div>
      </aside>

      {/* ================= Mobile Bottom Navigation ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2a2a2a] bg-[#1a1a1a] lg:hidden">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <div className="relative flex items-center justify-center w-12 h-12">
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active"
                        className="absolute inset-0 rounded-2xl bg-[rgba(199,164,129,0.25)]"
                        transition={fast}
                      />
                    )}

                    <Icon
                      className="relative z-10 w-6 h-6"
                      strokeWidth={2}
                      style={{ color: isActive ? '#c7a481' : '#71717a' }}
                    />
                  </div>

                  <span
                    className="mt-1 text-xs font-medium"
                    style={{ color: isActive ? '#c7a481' : '#71717a' }}
                  >
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer */}
      <div className="hidden lg:block lg:w-64" />
    </>
  );
}
