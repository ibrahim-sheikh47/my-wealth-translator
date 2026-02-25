// app/living/custom-calculator/page.jsx
// Route: /living/custom-calculator?fromState=...&toState=...&income=...

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

// --- Firebase Imports ---
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import FormInput from "@/app/components/FormInput";

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

// ─── Inner (needs useSearchParams) ───────────────────────────────────────────
function CustomCalculatorInner() {
  const router = useRouter();
  const params = useSearchParams();
  const fromState = params.get("fromState") || "California";
  const toState = params.get("toState") || "Texas";
  const income = Number(params.get("income") || 82000);

  // ✅ Fetch actual expense data from Firestore (Option B)
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
          // Store actual index values, not ratios
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
        console.error("[v0] Error fetching expense data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenseData();
  }, [fromState, toState]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: Object.fromEntries(
      CATEGORIES.map((c) => [c.name, c.default]),
    ),
  });

  const onSubmit = (data) => {
    if (!firestoreData) return;

    // Calculate expense translations using actual index ratios from Firestore
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
      const indices = indexMap[cat.name];

      // Apply ratio: user_input * (toIndex / fromIndex)
      const ratio = indices.to / indices.from;
      const translatedExpense = Math.round(userInput * ratio);

      return {
        name: cat.name,
        label: cat.label,
        from: userInput,
        to: translatedExpense,
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
