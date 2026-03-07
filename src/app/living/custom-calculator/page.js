// app/living/custom-calculator/page.jsx
// Route: /living/custom-calculator?fromState=...&toState=...&income=...
// Also accepts: &housing=...&transportation=...&food=...&utilities=...&healthcare=...
// (these are populated when coming from a saved report on the Profile page)

"use client";

import { Suspense, useEffect, useState } from "react";
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
  Zap,
  HeartPulse,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import FormInput from "@/app/components/FormInput";
import GoodMorning from "@/app/components/GoodMorning";

// ─── Validation ───────────────────────────────────────────────────────────────
const schema = yup.object({
  housing: yup.number().typeError("Enter a number").min(0).required("Required"),
  transportation: yup
    .number()
    .typeError("Enter a number")
    .min(0)
    .required("Required"),
  food: yup.number().typeError("Enter a number").min(0).required("Required"),
  utilities: yup
    .number()
    .typeError("Enter a number")
    .min(0)
    .required("Required"),
  healthcare: yup
    .number()
    .typeError("Enter a number")
    .min(0)
    .required("Required"),
});

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    name: "housing",
    label: "Housing",
    icon: Home,
    placeholder: "Enter your monthly housing cost",
  },
  {
    name: "transportation",
    label: "Transportation",
    icon: Car,
    placeholder: "Enter your monthly transportation cost",
  },
  {
    name: "food",
    label: "Food",
    icon: UtensilsCrossed,
    placeholder: "Enter your monthly food budget",
  },
  {
    name: "utilities",
    label: "Utilities",
    icon: Zap,
    placeholder: "Enter your monthly utilities cost",
  },
  {
    name: "healthcare",
    label: "Healthcare",
    icon: HeartPulse,
    placeholder: "Enter your monthly healthcare cost",
  },
];

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

// ─── State pair card ───────────────────────────────────────────────────────────
function CityCard({ fromState, toState, income, onEdit }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center justify-between"
      style={{ backgroundColor: "#2a2a2a" }}
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="w-2 h-2 rounded-full bg-[#c7a481] inline-block" />
          {fromState}
        </div>
        <div
          className="border-l-2 border-dashed border-gray-600 ml-1 h-3"
          aria-hidden
        />
        <div className="flex items-center gap-2 text-white font-medium">
          <span className="w-2 h-2 rounded-full bg-white inline-block" />
          {toState}
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

// ─── Inner ────────────────────────────────────────────────────────────────────
function CustomCalculatorInner() {
  const router = useRouter();
  const params = useSearchParams();

  const fromState = params.get("fromState") || "California";
  const toState = params.get("toState") || "Texas";
  const income = Number(params.get("income") || 82000);

  // ── Read pre-filled expense values from URL (set by Profile page) ──────────
  // If the param is present and a valid number, use it. Otherwise fall back to
  // an empty string so the field renders blank (not "0") for a fresh session.
  const prefilled = {
    housing: params.get("housing") ? Number(params.get("housing")) : undefined,
    transportation: params.get("transportation")
      ? Number(params.get("transportation"))
      : undefined,
    food: params.get("food") ? Number(params.get("food")) : undefined,
    utilities: params.get("utilities")
      ? Number(params.get("utilities"))
      : undefined,
    healthcare: params.get("healthcare")
      ? Number(params.get("healthcare"))
      : undefined,
  };

  // Flag: are we editing a saved report? Used to show a subtle "editing saved report" badge.
  const isEditingSaved = CATEGORIES.some(
    (c) => prefilled[c.name] !== undefined,
  );

  // ── Firestore cost-of-living index data ────────────────────────────────────
  const [firestoreData, setFirestoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenseData() {
      try {
        const fromSnap = await getDoc(doc(db, "cost_of_living", fromState));
        const toSnap = await getDoc(doc(db, "cost_of_living", toState));
        if (fromSnap.exists() && toSnap.exists()) {
          const f = fromSnap.data();
          const t = toSnap.data();
          setFirestoreData({
            from: {
              housingIdx: f.housing,
              transIdx: f.trans,
              foodIdx: f.grocery,
              utilitiesIdx: f.utilities,
              healthIdx: f.health,
            },
            to: {
              housingIdx: t.housing,
              transIdx: t.trans,
              foodIdx: t.grocery,
              utilitiesIdx: t.utilities,
              healthIdx: t.health,
            },
          });
        }
      } catch (err) {
        console.error("[CustomCalculator] Firestore fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenseData();
  }, [fromState, toState]);

  // ── useForm ────────────────────────────────────────────────────────────────
  // NOTE: defaultValues won't work here because useSearchParams resolves
  // asynchronously in Next.js — the form mounts before params are available.
  // Solution: initialise with empty defaults, then call reset() once params land.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      housing: "",
      transportation: "",
      food: "",
      utilities: "",
      healthcare: "",
    },
  });

  // ── Populate form fields once URL params (and thus prefilled) are ready ────
  useEffect(() => {
    if (!isEditingSaved) return; // nothing to pre-fill for a fresh session
    reset({
      housing: prefilled.housing ?? "",
      transportation: prefilled.transportation ?? "",
      food: prefilled.food ?? "",
      utilities: prefilled.utilities ?? "",
      healthcare: prefilled.healthcare ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — params are stable strings by the time JS executes

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = (data) => {
    if (!firestoreData) return;

    const indexMap = {
      housing: {
        from: firestoreData.from.housingIdx,
        to: firestoreData.to.housingIdx,
      },
      transportation: {
        from: firestoreData.from.transIdx,
        to: firestoreData.to.transIdx,
      },
      food: { from: firestoreData.from.foodIdx, to: firestoreData.to.foodIdx },
      utilities: {
        from: firestoreData.from.utilitiesIdx,
        to: firestoreData.to.utilitiesIdx,
      },
      healthcare: {
        from: firestoreData.from.healthIdx,
        to: firestoreData.to.healthIdx,
      },
    };

    const expenses = CATEGORIES.map((cat) => {
      const userInput = Number(data[cat.name]);
      const ratio = indexMap[cat.name].to / indexMap[cat.name].from;
      return {
        name: cat.name,
        label: cat.label,
        from: userInput,
        to: Math.round(userInput * ratio),
      };
    });

    const detailParams = new URLSearchParams({
      fromState,
      toState,
      income,
      expenses: JSON.stringify(expenses),
    });

    router.push(`/living/custom-calculator/detail?${detailParams.toString()}`);
  };

  const editUrl = `/living/detail?fromState=${encodeURIComponent(fromState)}&toState=${encodeURIComponent(toState)}&income=${income}`;

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#c7a481]" />
      </div>
    );

  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div className="px-5 py-8 lg:px-8 lg:py-12">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <GoodMorning />
        {/* Heading */}
        <h1 className="text-3xl lg:text-4xl font-extrabold mb-1 leading-tight">
          Your custom <span className="text-[#c7a481]">living expense</span>{" "}
          calculator
        </h1>

        {/* State card */}
        <div className="mt-6">
          <CityCard
            fromState={fromState}
            toState={toState}
            income={income}
            onEdit={() => router.push(editUrl)}
          />
        </div>

        {/* Subtext */}
        <p className="text-gray-400 text-sm mt-5 mb-7 leading-relaxed max-w-md">
          {isEditingSaved
            ? "Your previously saved values are pre-filled below. Adjust any amounts and hit Calculate to get fresh results."
            : "Enter your monthly expenses in each category for a comparison between your current state and your target state."}
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
                    <span className="text-white font-semibold text-sm">
                      {cat.label}
                    </span>
                  </div>
                  <FormInput
                    type="number"
                    placeholder={cat.placeholder}
                    title={cat.label}
                    name={cat.name}
                    register={register}
                    error={errors[cat.name]}
                    icon={
                      <span className="text-xs font-bold text-[#c7a481]">
                        $
                      </span>
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
