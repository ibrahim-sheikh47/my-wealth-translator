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
} from "lucide-react";
import { useState } from "react";
import { retirementSchema } from "../validations/schema";

export default function Retirement() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(retirementSchema),
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
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

        <div className="w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            {/* CURRENT AGE */}
            <div className="md:grid md:grid-rows-2 grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="What is your current age?"
                  title="Current Age"
                  name="currentAge"
                  type="number"
                  register={register}
                  error={errors.currentAge}
                  placeholder="35"
                  icon={<Calendar />}
                />
              </div>

              {/* ANNUAL INCOME */}
              <div className="space-y-2">
                <FormInput
                  label="What is your annual pre-tax income?"
                  title="Income"
                  name="income"
                  type="number"
                  register={register}
                  error={errors.income}
                  placeholder="82000"
                  icon={<HandCoinsIcon />}
                />
              </div>

              {/* CURRENT SAVINGS */}
              <div className="space-y-2">
                <FormInput
                  label="What are your current retirement savings?"
                  title="Savings"
                  name="savings"
                  type="number"
                  register={register}
                  error={errors.savings}
                  placeholder="150000"
                  icon={<Wallet />}
                />
              </div>

              {/* MONTHLY CONTRIBUTION */}
              <div className="space-y-2">
                <FormInput
                  label="How much is your monthly contribution?"
                  title="Contribution"
                  name="contribution"
                  type="number"
                  register={register}
                  error={errors.contribution}
                  placeholder="1000"
                  icon={<TrendingUp />}
                />
              </div>

              {/* RETIREMENT BUDGET */}
              <div className="space-y-2">
                <FormInput
                  label="What is your expected retirement budget?"
                  title="Budget"
                  name="budget"
                  type="number"
                  register={register}
                  error={errors.budget}
                  placeholder="60000"
                  icon={<DollarSign />}
                />
              </div>
            </div>
            {/* ADVANCED INPUTS SECTION */}
            <div className="mt-8 border-t border-gray-700 pt-6 ">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-[#c7a481] hover:text-[#d4b895] transition-colors font-medium mb-4"
              >
                <span>Advanced Inputs</span>
                {showAdvanced ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {showAdvanced && (
                <div className="animate-in fade-in duration-200 md:grid md:grid-rows-2 md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
                  {/* RETIREMENT AGE */}
                  <div className="space-y-2">
                    <FormInput
                      label="What is your expected retirement age?"
                      title="Retirement Age"
                      name="retirementAge"
                      type="number"
                      register={register}
                      error={errors.retirementAge}
                      placeholder="65"
                      icon={<Calendar />}
                    />
                  </div>

                  {/* INCOME INCREASE */}
                  <div className="space-y-2">
                    <FormInput
                      label="What is your estimated annual income increase?"
                      title="Income Increase"
                      name="incomeIncrease"
                      type="number"
                      register={register}
                      error={errors.incomeIncrease}
                      placeholder="3"
                      icon={<TrendingUp />}
                    />
                  </div>

                  {/* INFLATION RATE */}
                  <div className="space-y-2">
                    <FormInput
                      label="What is your estimated rate of inflation?"
                      title="Inflation Rate"
                      name="inflationRate"
                      type="number"
                      register={register}
                      error={errors.inflationRate}
                      placeholder="2.5"
                      icon={<TrendingUp />}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="mt-10">
              <Btn type="submit" title="Calculate" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
