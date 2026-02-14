/* eslint-disable @next/next/no-img-element */

"use client";

import GoodMorning from "../components/GoodMorning";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormInput from "../components/FormInput";
import RadioInput from "../components/RadioInput";
import Btn from "../components/Btn";
import {
  TrendingUp,
  DollarSign,
  Percent,
  Briefcase,
  Calendar,
  RefreshCcw,
  Share2,
} from "lucide-react";
import { stocksSchema } from "../validations/schema";
import { useRouter } from "next/navigation";

export default function Stocks() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(stocksSchema),
  });

  const onSubmit = (data) => {
    const params = new URLSearchParams({
      stockPlan:        data.stockPlan,
      nuaEligibility:   data.nuaEligibility,
      stockSymbol:      data.stockSymbol,
      grantDate:        data.grantDate,
      exerciseDate:     data.exerciseDate,
      costOfShare:      data.costOfShare,
      distributionDate: data.distributionDate,
      marketValue:      data.marketValue,
      taxRate:          data.taxRate,
      capitalGainsRate: data.capitalGainsRate,
      transactions:     data.transactions,
      shares:           data.shares,
    });
    router.push(`/stocks/detail?${params.toString()}`);
  };

  const stockPlanOptions = [
    { value: "espp", label: "Employee Stock Purchase Plan (ESPP)" },
    { value: "rsu",  label: "Restricted Stock Units (RSU)" },
    { value: "iso",  label: "Incentive Stock Options (ISO)" },
    { value: "nso",  label: "Non-Qualified Stock Options (NSO)" },
    { value: "sar",  label: "Stock Appreciation Rights (SAR)" },
  ];

  const nuaEligibilityOptions = [
    { value: "yes",      label: "Yes" },
    { value: "no",       label: "No" },
    { value: "not_sure", label: "I'm not sure" },
  ];

  const transactionOptions = [
    { value: "none",         label: "None" },
    { value: "exchange",     label: "Stock Exchange" },
    { value: "reinvestment", label: "Dividend Reinvestment" },
    { value: "both",         label: "Both Exchange and Reinvestment" },
  ];

  return (
    <div
      className="min-h-screen text-white px-6 py-8 lg:px-12 lg:py-12"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <GoodMorning />
      <div className="mt-10">
        <h1 className="md:text-4xl text-3xl font-bold mb-2">
          Translate your
          <span className="text-[#c7a481]"> employer stock plan</span>
        </h1>

        <p className="md:text-lg text-sm font-normal mb-5">
          Enter your stock plan details and tax information to receive
          calculated net earnings after tax impacts.
        </p>

        <div className="w-full md:mt-10">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">

            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="What is your employer's stock plan?"
                  title="Stock Plan"
                  name="stockPlan"
                  select={true}
                  options={stockPlanOptions}
                  register={register}
                  error={errors.stockPlan}
                  icon={<Briefcase />}
                />
              </div>
              <div className="space-y-2">
                <RadioInput
                  sx={{ color: "#c7a481", display: "flex", flexDirection: "row", gap: "1.5rem" }}
                  label="Is your stock plan NUA eligible?"
                  name="nuaEligibility"
                  register={register}
                  error={errors.nuaEligibility}
                  options={nuaEligibilityOptions}
                />
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="What is the stock symbol?"
                  title="Stock Symbol"
                  name="stockSymbol"
                  type="text"
                  register={register}
                  error={errors.stockSymbol}
                  placeholder="AAPL"
                  icon={<TrendingUp />}
                />
              </div>
              <div className="space-y-2">
                <FormInput
                  label="What is the grant date?"
                  title="Grant Date"
                  name="grantDate"
                  type="date"
                  register={register}
                  error={errors.grantDate}
                  icon={<Calendar />}
                />
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="When were the shares exercised?"
                  title="Exercise Date"
                  name="exerciseDate"
                  type="date"
                  register={register}
                  error={errors.exerciseDate}
                  icon={<Calendar />}
                />
              </div>
              <div className="space-y-2">
                <FormInput
                  label="What is the cost or basis of the shares?"
                  title="Cost of Share"
                  name="costOfShare"
                  type="number"
                  register={register}
                  error={errors.costOfShare}
                  placeholder="150.00"
                  icon={<DollarSign />}
                />
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="What is the distribution date?"
                  title="Distribution Date"
                  name="distributionDate"
                  type="date"
                  register={register}
                  error={errors.distributionDate}
                  icon={<Calendar />}
                />
              </div>
              <div className="space-y-2">
                <FormInput
                  label="What is the market value of the shares on the distribution date(s)?"
                  title="Market Value"
                  name="marketValue"
                  type="number"
                  register={register}
                  error={errors.marketValue}
                  placeholder="200.00"
                  icon={<DollarSign />}
                />
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="What is the income tax rate for ordinary income?"
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
                  label="What is the long-term capital gains tax rate?"
                  title="Capital Gains Rate"
                  name="capitalGainsRate"
                  type="number"
                  register={register}
                  error={errors.capitalGainsRate}
                  placeholder="15"
                  icon={<Percent />}
                />
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 w-full items-center gap-5 md:space-y-0 space-y-5">
              <div className="space-y-2">
                <FormInput
                  label="Were any transactions, like stock exchanges or reinvestments, performed with the shares?"
                  title="Transactions"
                  name="transactions"
                  select={true}
                  options={transactionOptions}
                  register={register}
                  error={errors.transactions}
                  icon={<RefreshCcw />}
                />
              </div>
              <div className="space-y-2 mt-5">
                <FormInput
                  label="What is the number of shares distributed in this transaction?"
                  title="Shares"
                  name="shares"
                  type="number"
                  register={register}
                  error={errors.shares}
                  placeholder="100"
                  icon={<Share2 />}
                />
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