/* eslint-disable @next/next/no-img-element */

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
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { incomeSchema } from "../validations/schema";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Income() {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(incomeSchema),
    defaultValues: {
      preTaxIncome:          75000,
      desiredAfterTaxIncome: 60000,
      timeFrame:             10,
      savings:               50000,
      taxRate:               20,
      inflationRate:         3,
    },
  });

  const onSubmit = (data) => {
    const params = new URLSearchParams({
      preTaxIncome:          data.preTaxIncome,
      desiredAfterTaxIncome: data.desiredAfterTaxIncome,
      timeFrame:             data.timeFrame,
      savings:               data.savings,
      taxRate:               data.taxRate        ?? 20,
      inflationRate:         data.inflationRate  ?? 3,
    });
    router.push(`/income/detail?${params.toString()}`);
  };

  return (
    <div
      className="min-h-screen text-white px-6 py-8 lg:px-12 lg:py-12"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <GoodMorning />
      {/* <div className="mt-10">
        <h1 className="md:text-4xl text-3xl font-bold mb-2">
          Translate your
          <span className="text-[#c7a481]"> current income</span>
        </h1>

        <p className="md:text-lg text-sm font-normal mb-5">
          Enter your pre-tax and after-tax income details and adjust inflation
          and tax parameters to receive required total savings to achieve your
          income goals.
        </p>

        <div className="w-full md:mt-10">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">

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

            <div
              className="rounded-xl border border-white/10 overflow-hidden"
              style={{ backgroundColor: "#242424" }}
            >
              <button
                type="button"
                onClick={() => setAdjustOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={20} className="text-[#c7a481]" />
                  <span className="text-base md:text-lg font-semibold text-white">
                    Adjust tax and inflation rates
                  </span>
                </div>
                <div className="text-[#c7a481]">
                  {adjustOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {adjustOpen && (
                <div className="px-5 pb-6 pt-2">
                  <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
                    <div className="space-y-2">
                      <FormInput
                        label="Select your tax rate."
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
                        label="Select your inflation rate."
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
              )}
            </div>

            <div className="mt-10 md:mx-auto md:max-w-2xl">
              <Btn type="submit" title="Calculate" />
            </div>
          </form>
        </div>
      </div> */}
      <div className="justify-center items-center h-screen -mt-40 flex">
        TO BE DEVELOPED
      </div>
    </div>
  );
}