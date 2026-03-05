'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#111]">
      <Image
        src="/logo.png"
        alt="My Wealth Translator"
        width={200}
        height={200}
        priority
      />
       <h1 className="text-3xl mt-5 font-semibold text-[#c7a481] mb-5">
              My Wealth Translator
            </h1>
            {/* Subtitle */}
            <h2 className="text-lg font-medium text-[#c7a481] mb-5">
              The Financial Co-Pilot
            </h2>
    </div>
  );
}