// app/living/custom-calculator/page.jsx
// Route: /living/custom-calculator?fromCity=...&toCity=...&income=...

"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeft,
  Pencil,
  Home,
  Car,
  UtensilsCrossed,
  Smile,
  HeartPulse,
} from "lucide-react";
import FormInput from "../../components/FormInput";

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = yup.object({
  housing:        yup.number().typeError("Enter a number").min(0).required("Required"),
  transportation: yup.number().typeError("Enter a number").min(0).required("Required"),
  food:           yup.number().typeError("Enter a number").min(0).required("Required"),
  entertainment:  yup.number().typeError("Enter a number").min(0).required("Required"),
  healthcare:     yup.number().typeError("Enter a number").min(0).required("Required"),
});

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "housing",        label: "Housing",       icon: Home,            placeholder: "2543", default: 2543 },
  { name: "transportation", label: "Transportation", icon: Car,             placeholder: "250",  default: 250  },
  { name: "food",           label: "Food",           icon: UtensilsCrossed, placeholder: "300",  default: 300  },
  { name: "entertainment",  label: "Entertainment",  icon: Smile,           placeholder: "100",  default: 100  },
  { name: "healthcare",     label: "Healthcare",     icon: HeartPulse,      placeholder: "350",  default: 350  },
];

// ─── City index ───────────────────────────────────────────────────────────────
const CITY_INDEX = {
  "san francisco, ca": 192,
  "dallas, tx":        101,
  "new york, ny":      187,
  "austin, tx":        118,
  "chicago, il":       107,
  "los angeles, ca":   173,
  "miami, fl":         123,
  "seattle, wa":       150,
  "denver, co":        128,
  "boston, ma":        162,
  default:             100,
};
const getIndex = (city) => CITY_INDEX[city?.toLowerCase().trim()] ?? CITY_INDEX.default;

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

// ─── City pair card ───────────────────────────────────────────────────────────
function CityCard({ fromCity, toCity, income, onEdit }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center justify-between"
      style={{ backgroundColor: "#2a2a2a" }}
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="w-2 h-2 rounded-full bg-[#c7a481] inline-block" />
          {fromCity}
        </div>
        <div className="border-l-2 border-dashed border-gray-600 ml-1 h-3" aria-hidden />
        <div className="flex items-center gap-2 text-white font-medium">
          <span className="w-2 h-2 rounded-full bg-white inline-block" />
          {toCity}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-80 active:scale-95"
        style={{ backgroundColor: "#3a3a3a" }}
      >
        <span className="text-xs font-bold" style={{ color: "#7ec87e" }}>
          ↑ {fmt(income)}
        </span>
        <Pencil size={13} className="text-gray-400" />
      </button>
    </div>
  );
}

// ─── Inner (needs useSearchParams) ───────────────────────────────────────────
function CustomCalculatorInner() {
  const router   = useRouter();
  const params   = useSearchParams();
  const fromCity = params.get("fromCity") || "San Francisco, CA";
  const toCity   = params.get("toCity")   || "Dallas, TX";
  const income   = Number(params.get("income") || 82000);

  const ratio = getIndex(toCity) / getIndex(fromCity);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: Object.fromEntries(CATEGORIES.map((c) => [c.name, c.default])),
  });

  const onSubmit = (data) => {
    const expenses = CATEGORIES.map((cat) => ({
      name:  cat.name,
      label: cat.label,
      from:  Number(data[cat.name]),
      to:    Math.round(Number(data[cat.name]) * ratio),
    }));

    const detailParams = new URLSearchParams({
      fromCity,
      toCity,
      income,
      expenses: JSON.stringify(expenses),
    });

    router.push(`/living/custom-calculator/detail?${detailParams.toString()}`);
  };

  const editUrl = `/living/detail?fromCity=${encodeURIComponent(fromCity)}&toCity=${encodeURIComponent(toCity)}&income=${income}`;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="px-5 py-8 lg:px-8 lg:py-12">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Heading */}
        <h1 className="text-3xl lg:text-4xl font-extrabold mb-1 leading-tight">
          Your custom{" "}
          <span className="text-[#c7a481]">living expense</span>{" "}
          calculator
        </h1>

        {/* City card */}
        <div className="mt-6">
          <CityCard
            fromCity={fromCity}
            toCity={toCity}
            income={income}
            onEdit={() => router.push(editUrl)}
          />
        </div>

        {/* Subtext */}
        <p className="text-gray-400 text-sm mt-5 mb-7 leading-relaxed max-w-md">
          Enter your monthly expenses in each category for a comparison between
          your current state and your target state.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.name} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#2a2a2a" }}
                    >
                      <Icon size={15} className="text-[#c7a481]" />
                    </div>
                    <span className="text-white font-semibold text-sm">{cat.label}</span>
                  </div>

                  <FormInput
                    title="Expense"
                    name={cat.name}
                    type="number"
                    register={register}
                    error={errors[cat.name]}
                    placeholder={cat.placeholder}
                    icon={
                      <span className="text-xs font-bold text-[#c7a481]">$</span>
                    }
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="w-full mt-10 py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#8b1c1c" }}
          >
            Calculate
          </button>
        </form>

        <div className="h-24" />
      </div>
    </div>
  );
}

export default function CustomCalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <CustomCalculatorInner />
    </Suspense>
  );
}