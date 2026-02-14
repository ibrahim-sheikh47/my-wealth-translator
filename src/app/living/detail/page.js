/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Car,
  UtensilsCrossed,
  Smile,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import GoodMorning from "@/app/components/GoodMorning";
import Btn from "@/app/components/Btn";

// ─── Utility ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const fmtFull = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

// ─── Mock data (replace with real API / router state) ────────────────────────
const DEFAULT_DATA = {
  fromCity: "San Francisco, CA",
  toCity: "Dallas, TX",
  fromIncome: 82000,
  toIncome: 48235.99,
  pct: 40, // savings %
  barMax: 100000,
  categories: [
    {
      id: "housing",
      label: "Housing",
      icon: Home,
      pct: 65,
      dir: "lower",
      rows: [
        {
          label: "Median Rent (2BR)",
          from: 3862,
          to: 1588,
        },
        {
          label: "Median Home Price (3BR)",
          from: 1408349,
          to: 485750,
        },
      ],
    },
    {
      id: "transportation",
      label: "Transportation",
      icon: Car,
      pct: 35,
      dir: "lower",
      rows: [
        { label: "Monthly Transit Pass", from: 108, to: 96 },
        { label: "Gas (per gallon)", from: 4.89, to: 3.12 },
        { label: "Car Insurance (annual)", from: 2340, to: 1520 },
      ],
    },
    {
      id: "food",
      label: "Food",
      icon: UtensilsCrossed,
      pct: 20,
      dir: "lower",
      rows: [
        { label: "Groceries (monthly)", from: 620, to: 490 },
        { label: "Restaurant meal (mid)", from: 28, to: 18 },
        { label: "Coffee", from: 7.5, to: 5.25 },
      ],
    },
    {
      id: "entertainment",
      label: "Entertainment",
      icon: Smile,
      pct: 10,
      dir: "lower",
      rows: [
        { label: "Movie Ticket", from: 18, to: 13 },
        { label: "Gym Membership (mo.)", from: 85, to: 55 },
        { label: "Streaming (avg bundle)", from: 52, to: 48 },
      ],
    },
    {
      id: "healthcare",
      label: "Healthcare",
      icon: HeartPulse,
      pct: 14,
      dir: "lower",
      rows: [
        { label: "Dr. Visit (w/o insurance)", from: 280, to: 210 },
        { label: "Dental Cleaning", from: 220, to: 160 },
        { label: "Rx (avg monthly)", from: 95, to: 78 },
      ],
    },
  ],
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Top city-pair card */
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
        <div
          className="border-l-2 border-dashed border-gray-600 ml-1 h-3"
          aria-hidden
        />
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

/** Animated count-up number */
function CountUp({ target, prefix = "$", duration = 1200 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(ease * target * 100) / 100);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

/** Bar chart comparing incomes */
function IncomeBarChart({ fromCity, toCity, fromIncome, toIncome, barMax }) {
  const fromH = (fromIncome / barMax) * 100;
  const toH = (toIncome / barMax) * 100;

  const ticks = [0, 20000, 40000, 60000, 80000, 100000];

  return (
    <div className="relative w-full mt-10">
      {/* Y-axis ticks */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col-reverse justify-between pb-1">
        {ticks.map((t) => (
          <span key={t} className="text-xs text-gray-500 leading-none">
            {t === 0
              ? "$0"
              : t === 100000
                ? "$100k"
                : t === 20000
                  ? "$20k"
                  : t === 40000
                    ? "$40k"
                    : t === 60000
                      ? "$60k"
                      : t === 80000
                        ? "$80k"
                        : ""}
          </span>
        ))}
      </div>

      {/* Chart area */}
      <div className="ml-14 flex items-end gap-8 h-52">
        {/* From bar */}
        <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
          <span
            className="text-base font-bold text-white"
            style={{ marginBottom: 6 }}
          >
            {fmt(fromIncome)}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-1000"
            style={{
              height: `${fromH}%`,
              backgroundColor: "#c7a481",
            }}
          />
          <span className="text-xs text-gray-400 text-center leading-tight pt-1">
            {fromCity}
          </span>
        </div>

        {/* To bar */}
        <div className="flex flex-col items-center flex-1 gap-2 h-full justify-end">
          <span
            className="text-base font-bold text-white"
            style={{ marginBottom: 6 }}
          >
            {fmt(toIncome)}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-1000"
            style={{
              height: `${toH}%`,
              backgroundColor: "#f5e6d0",
            }}
          />
          <span className="text-xs text-gray-400 text-center leading-tight pt-1">
            {toCity}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Expandable expense category row */
function CategoryRow({ cat, fromCity, toCity }) {
  const [open, setOpen] = useState(cat.id === "housing");
  const { icon: Icon } = cat;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#2a2a2a" }}
    >
      {/* Header */}
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
          <span className="text-white font-semibold text-sm">{cat.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "rgba(126,200,126,0.15)",
              color: "#7ec87e",
            }}
          >
            ↓ {cat.pct}% {cat.dir}
          </span>
          {open ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-5 pb-5">
          {/* Column headers */}
          <div className="grid grid-cols-3 text-xs text-gray-500 mb-3 border-t border-white/5 pt-4">
            <span />
            <span
              className="text-center font-medium"
              style={{ color: "#c7a481" }}
            >
              {fromCity.split(",")[0]}
            </span>
            <span className="text-center font-medium text-gray-300">
              {toCity.split(",")[0]}
            </span>
          </div>

          {/* Rows */}
          <div className="space-y-3">
            {cat.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-3 text-sm items-center"
              >
                <span className="text-gray-400 text-xs leading-tight pr-2">
                  {row.label}
                </span>
                <span
                  className="text-center font-semibold"
                  style={{ color: "#c7a481" }}
                >
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
export default function LivingDetail({ data = DEFAULT_DATA }) {
  const router = useRouter();

  const { fromCity, toCity, fromIncome, toIncome, pct, barMax, categories } =
    data;

     const calcParams = new URLSearchParams({
    fromCity,
    toCity,
    income: fromIncome,
  }).toString();

  return (
    <div className=" text-white" style={{ backgroundColor: "#1a1a1a" }}>
      {/* ── Scrollable content wrapper ── */}
      <div className="w-full justify-between px-5 py-8 lg:px-8 lg:py-12">
        <GoodMorning />
        <div className="my-10">
          <h1 className="text-4xl font-bold mb-4">
            Translate your
            <span className="text-[#c7a481]"> cost of living</span>
          </h1>
        </div>
        <div className="md:flex items-start gap-10">
          <div className="w-full flex-1">
            {" "}
            {/* City pair card */}
            <CityCard
              fromCity={fromCity}
              toCity={toCity}
              income={fromIncome}
              onEdit={() => router.back()}
            />
            {/* Headline */}
            <div className="mt-8 mb-2">
              <p className="text-gray-400 text-sm my-5">
                In {toCity}, you'll need a household income of
              </p>
              <div className="flex items-center gap-3 mt-1">
                <h2
                  className="text-4xl  lg:text-5xl font-extrabold tracking-tight"
                  style={{ color: "#c7a481" }}
                >
                  <CountUp target={toIncome} />
                </h2>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(126,200,126,0.15)",
                    color: "#7ec87e",
                  }}
                >
                  ↓ {pct}%
                </span>
              </div>
            </div>
            {/* Bar chart */}
            <IncomeBarChart
              fromCity={fromCity}
              toCity={toCity}
              fromIncome={fromIncome}
              toIncome={toIncome}
              barMax={barMax}
            />
          </div>
          <div className="w-full flex-1">
            {" "}
            {/* Section title */}
            <h3 className="text-lg font-bold text-white mb-4 md:mt-0 mt-10">
              Common Living Expenses
            </h3>
            {/* Category accordion */}
            <div className="space-y-3">
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat}
                  fromCity={fromCity}
                  toCity={toCity}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 md:max-w-2xl mx-auto">
          <Btn
            title={"Custom expense calculator"}
            onClick={() => router.push(`/living/custom-calculator?${calcParams}`)}
          />
        </div>
        {/* Bottom spacer for mobile nav */}
        <div className="h-24" />
      </div>
    </div>
  );
}
