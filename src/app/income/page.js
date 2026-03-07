"use client";

import GoodMorning from "../components/GoodMorning";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "../components/FormInput";
import Btn from "../components/Btn";
import {
  DollarSign,
  Clock,
  PiggyBank,
  Percent,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect } from "react";
import { incomeSchema } from "../validations/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ─── Inner form ───────────────────────────────────────────────────────────────
function IncomeFormInner() {
  const router = useRouter();
  const params = useSearchParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(incomeSchema),
    // Empty defaults — reset() below populates from URL params if present
    defaultValues: {
      preTaxIncome: "",
      desiredAfterTaxIncome: "",
      timeFrame: "",
      savings: "",
      taxRate: "",
      inflationRate: "",
    },
  });

  // ── Pre-fill from URL params (set by Profile page when loading a saved report)
  useEffect(() => {
    const preTaxIncome = params.get("preTaxIncome");
    const desiredAfterTaxIncome = params.get("desiredAfterTaxIncome");
    const timeFrame = params.get("timeFrame");
    const savings = params.get("savings");
    const taxRate = params.get("taxRate");
    const inflationRate = params.get("inflationRate");

    // Only reset if at least one core field is present
    if (!preTaxIncome && !desiredAfterTaxIncome) return;

    reset({
      preTaxIncome: preTaxIncome || "",
      desiredAfterTaxIncome: desiredAfterTaxIncome || "",
      timeFrame: timeFrame || "",
      savings: savings || "",
      taxRate: taxRate || "",
      inflationRate: inflationRate || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — params are stable by the time JS executes

  const onSubmit = (data) => {
    const urlParams = new URLSearchParams({
      preTaxIncome: data.preTaxIncome,
      desiredAfterTaxIncome: data.desiredAfterTaxIncome,
      timeFrame: data.timeFrame,
      savings: data.savings,
      taxRate: data.taxRate,
      inflationRate: data.inflationRate,
    });
    router.push(`/income/detail?${urlParams.toString()}`);
  };

  return (
    <div
      className="min-h-screen text-white px-6 py-8 lg:px-12 lg:py-12"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <GoodMorning />
      <div className="mt-10">
        <h1 className="md:text-4xl text-3xl font-bold mb-2">
          Translate your <span className="text-[#c7a481]"> current income</span>
        </h1>
        <p className="md:text-lg text-sm font-normal mb-5">
          Enter your pre-tax and after-tax income details and adjust inflation
          and tax parameters to receive required total savings to achieve your
          income goals.
        </p>

        <div className="w-full md:mt-10">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            {/* Row 1 — income fields */}
            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="What is your current pre-tax income?"
                  title="Income"
                  name="preTaxIncome"
                  type="number"
                  register={register}
                  error={errors.preTaxIncome}
                  placeholder="80,000"
                  icon={<DollarSign />}
                />
              </div>
              <div className="space-y-2">
                <FormInput
                  label="What is your desired after-tax income?"
                  title="Income"
                  name="desiredAfterTaxIncome"
                  type="number"
                  register={register}
                  error={errors.desiredAfterTaxIncome}
                  placeholder="60,000"
                  icon={<DollarSign />}
                />
              </div>
            </div>

            {/* Row 2 — time frame + savings */}
            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="What is your time frame to reach your goal?"
                  title="Time Frame"
                  name="timeFrame"
                  type="number"
                  register={register}
                  error={errors.timeFrame}
                  placeholder="10"
                  icon={<Clock />}
                />
              </div>
              <div className="space-y-2">
                <FormInput
                  label="How much do you currently have in savings?"
                  title="Savings"
                  name="savings"
                  type="number"
                  register={register}
                  error={errors.savings}
                  placeholder="25,000"
                  icon={<PiggyBank />}
                />
              </div>
            </div>

            {/* Row 3 — tax + inflation: mandatory, always visible */}
            <div
              className="rounded-xl border border-white/10 overflow-hidden"
              style={{ backgroundColor: "#242424" }}
            >
              <div className="w-full flex items-center gap-3 px-5 py-4">
                <SlidersHorizontal size={20} className="text-[#c7a481]" />
                <span className="text-base md:text-lg font-semibold text-white">
                  Tax and inflation rates
                </span>
                <span className="ml-auto text-xs font-semibold text-[#c7a481] border border-[#c7a481]/40 rounded-full px-2 py-0.5">
                  Required
                </span>
              </div>
              <div className="px-5 pb-6 pt-2">
                <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
                  <div className="space-y-2">
                    <FormInput
                      label="What is your federal marginal tax rate? refer to IRS.gov"
                      title="Tax Rate"
                      name="taxRate"
                      type="number"
                      register={register}
                      error={errors.taxRate}
                      placeholder="24"
                      icon={<Percent />}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormInput
                      label="What is your inflation rate?"
                      title="Inflation Rate"
                      name="inflationRate"
                      type="number"
                      register={register}
                      error={errors.inflationRate}
                      placeholder="3"
                      icon={<Percent />}
                    />
                  </div>
                </div>
              </div>
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

export default function Income() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <IncomeFormInner />
    </Suspense>
  );
}
