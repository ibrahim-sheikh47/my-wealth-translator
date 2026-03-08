"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#111] px-4">
      <Image
        src="/logo.png"
        alt="My Wealth Translator"
        width={200}
        height={200}
        priority
        className="w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px]"
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl mt-4 sm:mt-5 font-semibold text-[#c7a481] mb-2 sm:mb-3 text-center">
        My Wealth Translator
      </h1>
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#c7a481] mb-4 sm:mb-5 text-center">
        The Financial Co-Pilot
      </h2>
    </div>
  );
}