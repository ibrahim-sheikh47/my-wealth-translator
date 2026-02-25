/* eslint-disable @next/next/no-img-element */

"use client";

import GoodMorning from "../components/GoodMorning";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "../components/FormInput";
import Btn from "../components/Btn";
import {
  HandCoinsIcon,
  Calendar,
  Wallet,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { retirementSchema } from "../validations/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ─── Inner form ───────────────────────────────────────────────────────────────
function RetirementFormInner() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(retirementSchema),
    defaultValues: {
      currentAge: params.get("currentAge") || "",
      income: params.get("income") || "",
      savings: params.get("savings") || "",
      contribution: params.get("contribution") || "",
      budget: params.get("budget") || "",
      retirementAge: params.get("retirementAge") || "",
      incomeIncrease: params.get("incomeIncrease") || "",
      inflationRate: params.get("inflationRate") || "",
    },
  });

  // Auto-open advanced if advanced params exist
  useEffect(() => {
    if (
      params.get("retirementAge") ||
      params.get("incomeIncrease") ||
      params.get("inflationRate")
    ) {
      setShowAdvanced(true);
    }
  }, [params]);

  const onSubmit = (data) => {
    const urlParams = new URLSearchParams({
      currentAge: data.currentAge,
      income: data.income,
      savings: data.savings,
      contribution: data.contribution,
      budget: data.budget,
      retirementAge: data.retirementAge || "",
      incomeIncrease: data.incomeIncrease || "",
      inflationRate: data.inflationRate || "",
    });

    router.push(`/retirement/detail?${urlParams.toString()}`);
  };

  return (
    <div
      className="min-h-screen text-white px-6 py-8 lg:px-12 lg:py-12"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <GoodMorning />

      <div className="mt-10">
        <h1 className="md:text-4xl text-3xl font-bold mb-2">
          Translate your
          <span className="text-[#c7a481]"> Retirement options</span>
        </h1>

        <p className="md:text-lg text-sm font-normal mb-5">
          Enter data regarding your current retirement accounts and financial
          details to explore different retirement options
        </p>

        <div className="w-full md:mt-10">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            <div className="md:grid md:grid-rows-2 grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <FormInput
                label="What is your current age?"
                title="Current Age"
                name="currentAge"
                type="number"
                register={register}
                error={errors.currentAge}
                placeholder="Enter age"
                icon={<Calendar />}
              />

              <FormInput
                label="What is your annual pre-tax income?"
                title="Income"
                name="income"
                type="number"
                register={register}
                error={errors.income}
                placeholder="Enter income"
                icon={<HandCoinsIcon />}
              />

              <FormInput
                label="What are your current retirement savings?"
                title="Savings"
                name="savings"
                type="number"
                register={register}
                error={errors.savings}
                placeholder="Enter savings"
                icon={<Wallet />}
              />

              <FormInput
                label="How much is your monthly contribution?"
                title="Contribution"
                name="contribution"
                type="number"
                register={register}
                error={errors.contribution}
                placeholder="Enter monthly contribution"
                icon={<TrendingUp />}
              />

              <FormInput
                label="What is your expected annual retirement budget?"
                title="Annual Budget"
                name="budget"
                type="number"
                register={register}
                error={errors.budget}
                placeholder="Enter annual budget"
                icon={<DollarSign />}
              />
            </div>

            {/* Advanced Section */}
            <div
              className="rounded-xl border border-white/10 overflow-hidden"
              style={{ backgroundColor: "#242424" }}
            >
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={20} className="text-[#c7a481]" />
                  <span className="text-base md:text-lg font-semibold text-white">
                    Advanced Inputs
                  </span>
                </div>
                <div className="text-[#c7a481]">
                  {showAdvanced ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>

              {showAdvanced && (
                <div className="px-5 pb-6 pt-2 md:grid md:grid-cols-2 gap-5 space-y-5 md:space-y-0">
                  <FormInput
                    label="What is your expected retirement age?"
                    title="Retirement Age"
                    name="retirementAge"
                    type="number"
                    register={register}
                    error={errors.retirementAge}
                    placeholder="Enter retirement age"
                    icon={<Calendar />}
                  />

                  <FormInput
                    label="What is your estimated annual income increase? (%)"
                    title="Income Increase"
                    name="incomeIncrease"
                    type="number"
                    register={register}
                    error={errors.incomeIncrease}
                    placeholder="Enter income growth"
                    icon={<TrendingUp />}
                  />

                  <FormInput
                    label="What is your estimated rate of inflation? (%)"
                    title="Inflation Rate"
                    name="inflationRate"
                    type="number"
                    register={register}
                    error={errors.inflationRate}
                    placeholder="Enter inflation rate"
                    icon={<TrendingUp />}
                  />
                </div>
              )}
            </div>

            <div className="mt-10 md:mx-auto md:max-w-2xl">
              <Btn type="submit" title="Calculate" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Page export wrapped in Suspense ──────────────────────────────────────────
export default function Retirement() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <RetirementFormInner />
    </Suspense>
  );
}
