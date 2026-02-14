// app/living/custom-calculator/detail/page.jsx
// Route: /living/custom-calculator/detail?fromCity=...&toCity=...&income=...&expenses=[...]

"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Home,
  Car,
  UtensilsCrossed,
  Smile,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Download,
  Bookmark,
  RotateCcw,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const ICON_MAP = {
  housing:        Home,
  transportation: Car,
  food:           UtensilsCrossed,
  entertainment:  Smile,
  healthcare:     HeartPulse,
};

// Fallback demo data (used if no URL params)
const FALLBACK_EXPENSES = [
  { name: "housing",        label: "Housing",       from: 3862, to: 1588 },
  { name: "transportation", label: "Transportation", from: 2340, to: 1520 },
  { name: "food",           label: "Food",           from: 620,  to: 490  },
  { name: "entertainment",  label: "Entertainment",  from: 85,   to: 55   },
  { name: "healthcare",     label: "Healthcare",     from: 280,  to: 160  },
];

// ─── City Pair Card ───────────────────────────────────────────────────────────
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

// ─── Accordion category row ───────────────────────────────────────────────────
function CategoryRow({ expense, fromCity, toCity, isFirst }) {
  const [open, setOpen] = useState(isFirst);
  const Icon   = ICON_MAP[expense.name] ?? Home;
  const diff   = expense.to - expense.from;
  const pct    = Math.abs(Math.round((diff / expense.from) * 100));
  const lower  = diff <= 0;

  // Extra detail rows (illustrative per category)
  const DETAIL_ROWS = {
    housing: [
      { label: "Median Rent (2BR)",       from: expense.from * 1.5,  to: expense.to * 1.5  },
      { label: "Median Home Price (3BR)", from: expense.from * 363,  to: expense.to * 306  },
    ],
    transportation: [
      { label: "Monthly Transit Pass", from: expense.from * 0.046, to: expense.to * 0.063 },
      { label: "Gas (per gallon)",      from: 4.89,                 to: 3.12               },
      { label: "Car Insurance (yr)",    from: expense.from,         to: expense.to          },
    ],
    food: [
      { label: "Groceries (mo.)",       from: expense.from,         to: expense.to          },
      { label: "Restaurant meal",       from: 28,                   to: 18                  },
    ],
    entertainment: [
      { label: "Gym Membership",        from: expense.from,         to: expense.to          },
      { label: "Movie Ticket",          from: 18,                   to: 13                  },
    ],
    healthcare: [
      { label: "Dr. Visit",             from: expense.from,         to: expense.to          },
      { label: "Rx (monthly)",          from: 95,                   to: 78                  },
    ],
  };

  const rows = DETAIL_ROWS[expense.name] ?? [];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#2a2a2a" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <Icon size={17} className="text-[#c7a481]" />
          </div>
          <span className="text-white font-semibold text-sm">{expense.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: lower
                ? "rgba(126,200,126,0.15)"
                : "rgba(200,100,100,0.15)",
              color: lower ? "#7ec87e" : "#e07070",
            }}
          >
            {lower ? "↓" : "↑"} {pct}% {lower ? "lower" : "higher"}
          </span>
          {open
            ? <ChevronUp  size={16} className="text-gray-500" />
            : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-3 text-xs text-gray-500 mb-3 border-t border-white/5 pt-4">
            <span />
            <span className="text-center font-medium" style={{ color: "#c7a481" }}>
              {fromCity.split(",")[0]}
            </span>
            <span className="text-center font-medium text-gray-300">
              {toCity.split(",")[0]}
            </span>
          </div>
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-3 text-sm items-center">
                <span className="text-gray-400 text-xs leading-tight pr-2">{row.label}</span>
                <span className="text-center font-semibold" style={{ color: "#c7a481" }}>
                  {fmt(row.from)}
                </span>
                <span className="text-center font-semibold text-gray-200">{fmt(row.to)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function ExpenseBarChart({ expenses, activeIndex, setActiveIndex }) {
  const allValues  = expenses.flatMap((e) => [e.from, e.to]);
  const maxVal     = Math.max(...allValues);
  const chartMax   = Math.ceil((maxVal * 1.2) / 10000) * 10000;

  // Y-axis ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((chartMax / tickCount) * i)
  );

  const BAR_FROM = "#c7a481";
  const BAR_TO   = "#3a3a3a";
  const ACTIVE   = "#8b1c1c";

  return (
    <div className="relative w-full mt-6" style={{ backgroundColor: "#2a2a2a", borderRadius: 16, padding: "20px 16px 12px" }}>
      <div className="flex gap-0">
        {/* Y-axis */}
        <div className="flex flex-col-reverse justify-between w-10 pr-2" style={{ height: 160 }}>
          {ticks.map((t) => (
            <span key={t} className="text-xs text-gray-500 leading-none text-right block">
              {t === 0 ? "$0" : t >= 1000 ? `$${Math.round(t / 1000)}k` : `$${t}`}
            </span>
          ))}
        </div>

        {/* Bars area */}
        <div className="flex-1 flex items-end justify-around gap-1" style={{ height: 160 }}>
          {expenses.map((exp, i) => {
            const Icon     = ICON_MAP[exp.name] ?? Home;
            const fromH    = Math.max((exp.from / chartMax) * 100, 2);
            const toH      = Math.max((exp.to   / chartMax) * 100, 2);
            const isActive = activeIndex === i;

            return (
              <button
                key={exp.name}
                type="button"
                onClick={() => setActiveIndex(isActive ? null : i)}
                className="flex flex-col items-center gap-1 flex-1 max-w-[52px] relative"
                style={{ height: "100%" }}
              >
                {/* Tooltip on active */}
                {isActive && (
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10"
                    style={{ backgroundColor: ACTIVE, color: "#fff" }}
                  >
                    {fmt(exp.to)}
                  </div>
                )}

                <div className="flex items-end gap-0.5 w-full" style={{ height: "100%" }}>
                  {/* From bar */}
                  <div
                    className="flex-1 rounded-t-sm transition-all duration-700"
                    style={{
                      height:          `${fromH}%`,
                      backgroundColor: isActive ? BAR_FROM : "#4a4a4a",
                      opacity:         isActive ? 1 : 0.6,
                    }}
                  />
                  {/* To bar */}
                  <div
                    className="flex-1 rounded-t-sm transition-all duration-700"
                    style={{
                      height:          `${toH}%`,
                      backgroundColor: isActive ? ACTIVE : BAR_TO,
                      opacity:         isActive ? 1 : 0.7,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* X-axis icons */}
      <div className="flex items-center justify-around mt-3 pl-10">
        {expenses.map((exp, i) => {
          const Icon     = ICON_MAP[exp.name] ?? Home;
          const isActive = activeIndex === i;
          return (
            <button
              key={exp.name}
              type="button"
              onClick={() => setActiveIndex(isActive ? null : i)}
              className="flex-1 flex justify-center"
            >
              <Icon
                size={16}
                style={{ color: isActive ? "#c7a481" : "#555" }}
                className="transition-colors"
              />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#4a4a4a" }} />
          <span className="text-xs text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ACTIVE }} />
          <span className="text-xs text-gray-400">Target</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function CustomDetailInner() {
  const router   = useRouter();
  const params   = useSearchParams();
  const fromCity = params.get("fromCity") || "San Francisco, CA";
  const toCity   = params.get("toCity")   || "Dallas, TX";
  const income   = Number(params.get("income") || 82000);

  let expenses = FALLBACK_EXPENSES;
  try {
    const raw = params.get("expenses");
    if (raw) expenses = JSON.parse(raw);
  } catch {}

  const [activeBar, setActiveBar] = useState(0);

  const totalFrom = expenses.reduce((s, e) => s + e.from, 0);
  const totalTo   = expenses.reduce((s, e) => s + e.to,   0);
  const diff      = totalTo - totalFrom;
  const pct       = Math.abs(Math.round((diff / totalFrom) * 100));
  const cheaper   = diff < 0;

  const editUrl = `/living/custom-calculator?fromCity=${encodeURIComponent(fromCity)}&toCity=${encodeURIComponent(toCity)}&income=${income}&expenses=${encodeURIComponent(JSON.stringify(expenses))}`;

  const handleSave = () => {
    alert("Saved! (wire to your save API here)");
  };

  const handleExport = () => {
    const lines = [
      `Cost of Living Comparison: ${fromCity} → ${toCity}`,
      `Income: ${fmt(income)}`,
      "",
      "Category,Current,Target",
      ...expenses.map((e) => `${e.label},${e.from},${e.to}`),
      "",
      `Total,${totalFrom},${totalTo}`,
      `Difference,${diff > 0 ? "+" : ""}${diff} (${cheaper ? "-" : "+"}${pct}%)`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "cost-of-living.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    router.push("/living");
  };

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

        {/* Total summary pill */}
        <div className="mt-6 flex items-center gap-3">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Total monthly in {toCity}</p>
            <p className="text-2xl font-extrabold" style={{ color: "#c7a481" }}>
              {fmt(totalTo)}
            </p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full ml-1"
            style={{
              backgroundColor: cheaper
                ? "rgba(126,200,126,0.15)"
                : "rgba(200,100,100,0.15)",
              color: cheaper ? "#7ec87e" : "#e07070",
            }}
          >
            {cheaper ? "↓" : "↑"} {pct}%
          </span>
        </div>

        {/* Analysis section */}
        <h3 className="text-base font-bold text-white mt-8 mb-4 tracking-wide uppercase text-xs"
            style={{ letterSpacing: "0.08em", color: "#888" }}>
          Analysis
        </h3>

        {/* Accordion rows — 1-col mobile, 2-col desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {expenses.map((exp, i) => (
            <CategoryRow
              key={exp.name}
              expense={exp}
              fromCity={fromCity}
              toCity={toCity}
              isFirst={i === 0}
            />
          ))}
        </div>

        {/* Bar chart */}
        <ExpenseBarChart
          expenses={expenses}
          activeIndex={activeBar}
          setActiveIndex={setActiveBar}
        />

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#8b1c1c" }}
          >
            Save
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full py-4 rounded-2xl font-bold text-base border transition-all hover:bg-white/5 active:scale-[0.98]"
            style={{
              backgroundColor: "transparent",
              borderColor: "#c7a481",
              color: "#c7a481",
            }}
          >
            Export
          </button>

          {/* Start over */}
          <button
            onClick={handleStartOver}
            className="w-full py-4 rounded-2xl font-bold text-base border transition-all hover:bg-white/5 active:scale-[0.98]"
            style={{
              backgroundColor: "transparent",
              borderColor: "#3a3a3a",
              color: "#aaa",
            }}
          >
            Start over
          </button>
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}

export default function CustomDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <CustomDetailInner />
    </Suspense>
  );
}