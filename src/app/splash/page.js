'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 2500); // 2.5 sec splash

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative h-screen w-screen">
      <Image
        src="/splash.png"
        alt="My Wealth Translator"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
