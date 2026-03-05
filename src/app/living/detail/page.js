/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Home,
  Car,
  UtensilsCrossed,
  Smile,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Pencil,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import GoodMorning from "@/app/components/GoodMorning";
import Btn from "@/app/components/Btn";

// --- Firebase Imports ---
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// ─── Utility ────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n < 100) {
    // Small values like gas price — show 2 decimals
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }
  // Large values like rent, home price — no decimals needed
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
};
// ─── Sub-components ──────────────────────────────────────────────────────────

function StateCard({ fromState, toState, income, onEdit }) {
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
        <div className="border-l-2 border-dashed border-gray-600 ml-1 h-3" />
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
          Current: {fmt(income)}
        </span>
        <Pencil size={13} className="text-gray-400" />
      </button>
    </div>
  );
}

function CountUp({ target, prefix = "$", duration = 1200 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setValue(ease * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return (
    <span>
      {prefix}
      {value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
    </span>
  );
}

function IncomeBarChart({ fromState, toState, fromIncome, toIncome, barMax }) {
  const fromH = (fromIncome / barMax) * 100;
  const toH = (toIncome / barMax) * 100;

  // ✅ Ticks always derived from barMax — never hardcoded
  const tickStep = barMax / 5;
  const ticks = Array.from({ length: 6 }, (_, i) => i * tickStep);
  const fmtTick = (v) => {
    if (v === 0) return "$0";
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    return `$${Math.round(v / 1000)}k`;
  };

  return (
    <div className="relative w-full mt-10">
      <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col-reverse justify-between pb-1">
        {ticks.map((t) => (
          <span key={t} className="text-xs text-gray-500">
            {fmtTick(t)}
          </span>
        ))}
      </div>
      <div className="ml-18 flex items-end gap-8 h-52">
        <div className="flex flex-col items-center flex-1 h-full justify-end">
          <span className="text-base font-bold text-white mb-1">
            {fmt(fromIncome)}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-1000"
            style={{ height: `${fromH}%`, backgroundColor: "#c7a481" }}
          />
          <span className="text-xs text-gray-400 mt-1">{fromState}</span>
        </div>
        <div className="flex flex-col items-center flex-1 h-full justify-end">
          <span className="text-base font-bold text-white mb-1">
            {fmt(toIncome)}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-1000"
            style={{ height: `${toH}%`, backgroundColor: "#f5e6d0" }}
          />
          <span className="text-xs text-gray-400 mt-1">{toState}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ cat, fromState, toState }) {
  const [open, setOpen] = useState(cat.id === "housing");
  const { icon: Icon } = cat;

  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ backgroundColor: "#2a2a2a" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <Icon size={17} className="text-[#c7a481]" />
          </div>
          <span className="text-white font-semibold text-sm">{cat.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor:
                cat.dir === "lower"
                  ? "rgba(126,200,126,0.15)"
                  : "rgba(239,68,68,0.15)",
              color: cat.dir === "lower" ? "#7ec87e" : "#ef4444",
            }}
          >
            {cat.dir === "lower" ? "↓" : "↑"} {cat.pct}%
          </span>
          {open ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-3 text-xs text-gray-500 mb-3 border-t border-white/5 pt-4">
            <span />
            <span className="text-center" style={{ color: "#c7a481" }}>
              {fromState}
            </span>
            <span className="text-center text-gray-300">{toState}</span>
          </div>
          <div className="space-y-3">
            {cat.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-3 text-sm items-center"
              >
                <span className="text-gray-400 text-xs">{row.label}</span>
                <span className="text-center font-semibold text-[#c7a481]">
                  {fmt(row.from)}
                </span>
                <span className="text-center font-semibold text-gray-200">
                  {fmt(row.to)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function LivingDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Correct param names matching Living.jsx onSubmit
  const fromState = searchParams.get("fromState") || "California";
  const toState = searchParams.get("toState") || "Texas";
  const fromIncome = Number(searchParams.get("income")) || 82000;

  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLivingData() {
      try {
        setLoading(true);
        const fromSnap = await getDoc(doc(db, "cost_of_living", fromState));
        const toSnap = await getDoc(doc(db, "cost_of_living", toState));

        if (fromSnap.exists() && toSnap.exists()) {
          const f = fromSnap.data();
          const t = toSnap.data();

          setDbData({
            // Overall index
            fromIdx: f.index,
            toIdx: t.index,

            // Housing — index for % badge, dollar values for rows
            fromHousingIdx: f.housing,
            toHousingIdx: t.housing,
            fromMedianRent: f.medianRent,
            toMedianRent: t.medianRent,
            fromMedianHome: f.medianHome,
            toMedianHome: t.medianHome,

            // Transportation — index for % badge, dollar value for row
            fromTransIdx: f.trans,
            toTransIdx: t.trans,
            fromGasPrice: f.gasPrice,
            toGasPrice: t.gasPrice,

            // Utilities — index for % badge, dollar value for row
            fromUtilitiesIdx: f.utilities,
            toUtilitiesIdx: t.utilities,
            fromElecBill: f.elecBill,
            toElecBill: t.elecBill,

            // Groceries — index is the only value (used for both % badge and row display)
            fromGroceryIdx: f.grocery,
            toGroceryIdx: t.grocery,

            // Healthcare — index for % badge, dollar value for row
            fromHealthIdx: f.health,
            toHealthIdx: t.health,
            fromDocVisit: f.docVisit,
            toDocVisit: t.docVisit,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLivingData();
  }, [fromState, toState]);

  const processedData = useMemo(() => {
    if (!dbData) return null;

    const wealthRatio = dbData.toIdx / dbData.fromIdx;
    const translatedIncome = fromIncome * wealthRatio;
    // ✅ Align barMax to a clean tick boundary just above the larger value
    const maxVal = Math.max(fromIncome, translatedIncome);
    const rawStep = (maxVal * 1.15) / 5;
    const tickStep = Math.ceil(rawStep / 5000) * 5000;
    const barMax = tickStep * 5;

  const categories = [
  {
    id: "housing",
    label: "Housing",
    icon: Home,
    fromIdx: dbData.fromMedianRent,
    toIdx: dbData.toMedianRent,
    rows: [
      {
        label: "Median Rent / mo",
        from: dbData.fromMedianRent,
        to: dbData.toMedianRent,
      },
      {
        label: "Median Home Value",
        from: dbData.fromMedianHome,
        to: dbData.toMedianHome,
      },
    ],
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: UtensilsCrossed,
    fromIdx: dbData.fromGroceryIdx,
    toIdx: dbData.toGroceryIdx,
    rows: [
      {
        label: "Monthly Budget Est.",
        from: Math.round(400 * (dbData.fromGroceryIdx / 100)),
        to: Math.round(400 * (dbData.toGroceryIdx / 100)),
      },
    ],
  },
  {
    id: "transportation",
    label: "Transportation",
    icon: Car,
    fromIdx: dbData.fromGasPrice,
    toIdx: dbData.toGasPrice,
    rows: [
      {
        label: "Gas Price / gal",
        from: dbData.fromGasPrice,
        to: dbData.toGasPrice,
      },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: Zap,
    fromIdx: dbData.fromElecBill,
    toIdx: dbData.toElecBill,
    rows: [
      {
        label: "Avg Electric Bill / mo",
        from: dbData.fromElecBill,
        to: dbData.toElecBill,
      },
    ],
  },
  {
    id: "health",
    label: "Healthcare",
    icon: HeartPulse,
    fromIdx: dbData.fromDocVisit,
    toIdx: dbData.toDocVisit,
    rows: [
      {
        label: "Doctor Visit (cash)",
        from: dbData.fromDocVisit,
        to: dbData.toDocVisit,
      },
    ],
  },
];

    const enrichedCategories = categories.map((cat) => {
      const ratio = cat.toIdx / cat.fromIdx;
      return {
        ...cat,
        pct: Math.abs(Math.round((ratio - 1) * 100)),
        dir: ratio < 1 ? "lower" : "higher",
      };
    });

    return {
      translatedIncome,
      barMax,
      overallPct: Math.abs(Math.round((wealthRatio - 1) * 100)),
      overallDir: wealthRatio < 1 ? "lower" : "higher",
      categories: enrichedCategories,
    };
  }, [dbData, fromIncome]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c7a481]"></div>
      </div>
    );

  if (!processedData)
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-gray-400">
        No data found for selected states.
      </div>
    );

  return (
    <div className="min-h-screen text-white bg-[#1a1a1a]">
      <div className="w-full px-6 py-8 lg:px-12 lg:py-12">
        <GoodMorning />
        <div className="my-10">
          <h1 className="text-4xl font-bold mb-4">
            Translate your{" "}
            <span className="text-[#c7a481]">cost of living</span>
          </h1>
        </div>

        <div className="md:flex items-start gap-10">
          <div className="w-full flex-1">
            <StateCard
              fromState={fromState}
              toState={toState}
              income={fromIncome}
              onEdit={() => router.back()}
            />
            <div className="mt-8 mb-2">
              <p className="text-gray-400 text-sm my-5">
                In {toState}, you'll need a household income of
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#c7a481]">
                  <CountUp target={processedData.translatedIncome} />
                </h2>
                <span
                  className={`text-sm font-bold px-3 py-1.5 rounded-full ${
                    processedData.overallDir === "lower"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {processedData.overallDir === "lower" ? "↓" : "↑"}{" "}
                  {processedData.overallPct}%
                </span>
              </div>
            </div>
            <IncomeBarChart
              fromState={fromState}
              toState={toState}
              fromIncome={fromIncome}
              toIncome={processedData.translatedIncome}
              barMax={processedData.barMax}
            />
          </div>

          <div className="w-full flex-1">
            <h3 className="text-lg font-bold text-white mb-4 md:mt-0 mt-10">
              Common Living Expenses
            </h3>
            <div className="space-y-3">
              {processedData.categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  fromState={fromState}
                  toState={toState}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 md:max-w-2xl mx-auto">
          <Btn
            title={"Custom expense calculator"}
            onClick={() =>
              router.push(
                `/living/custom-calculator?fromState=${fromState}&toState=${toState}&income=${fromIncome}`,
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
