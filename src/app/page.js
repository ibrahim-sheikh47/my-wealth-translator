"use client";

import { Calculator, TrendingUp, Building2, Wallet, PiggyBank, DollarSign } from "lucide-react";
import GoodMorning from "./components/GoodMorning";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { fetchSubscriptionStatus } from "./store/slices/userProfileSlice";

const translators = [
  {
    name: (
      <>
        My <span className="text-[#c7a481]">Cost-of-Living</span> Translator
      </>
    ),
    icon: DollarSign,
    href: "/living",
  },
  {
    name: (
      <>
        My <span className="text-[#c7a481]">Retirement</span> Translator
      </>
    ),
    icon: PiggyBank,
    href: "/retirement",
  },
  {
    name: (
      <>
        My <span className="text-[#c7a481]">Amortization</span>{" "}
        Calculator
      </>
    ),
    icon: Calculator,
    href: "/amortization-calculator",
  },
  {
    name: (
      <>
        My <span className="text-[#c7a481]">Income</span> Translator
      </>
    ),
    icon: Wallet,
    href: "/income",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { plan } = useSelector((state) => state.userProfile);

  useEffect(() => {
    if (user?.uid && plan !== 'pro') {
      dispatch(fetchSubscriptionStatus(user.uid));
    }
  }, [user?.uid, plan, dispatch]);

  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-6 lg:px-12 lg:pt-12">
        <GoodMorning />

        {/* Main Title */}
        <div className="mb-8 mt-5">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            Let&apos;s start{" "}
            <span style={{ color: "#c7a481" }}>translating</span>
          </h1>
          <h1
            className="text-4xl lg:text-5xl font-bold"
            style={{ color: "#c7a481" }}
          >
            your wealth
          </h1>
          <p className="text-zinc-400 mt-4 text-base">
            Choose a translator to get started.
          </p>
        </div>

        {/* Translator Cards */}
        <div className="md:grid md:grid-rows-2 md:grid-cols-2 gap-5 md:space-y-0 space-y-4">
          {translators.map((translator) => {
            const Icon = translator.icon;
            return (
              <a
                key={translator.name}
                href={translator.href}
                className="flex items-center justify-between h-20 px-3 md:px-7 rounded-2xl bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#c7a481] hover:bg-[#252525]transition duration-300 ease-in-out"
              >
                <span className="text-base font-semibold text-white">
                  {translator.name}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: "rgba(199, 164, 129, 0.1)",
                    borderColor: "rgba(199, 164, 129, 0.2)",
                  }}
                >
                  <Icon
                    className="w-6 h-6"
                    strokeWidth={2}
                    style={{ color: "#c7a481" }}
                  />
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </div>
  );
}
