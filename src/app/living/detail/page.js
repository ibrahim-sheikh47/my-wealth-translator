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
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import GoodMorning from "@/app/components/GoodMorning";
import Btn from "@/app/components/Btn";

// --- Firebase Imports ---
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// ─── Utility ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

// ─── Sub-components ──────────────────────────────────────────────────────────

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
        <div className="border-l-2 border-dashed border-gray-600 ml-1 h-3" />
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

function IncomeBarChart({ fromCity, toCity, fromIncome, toIncome, barMax }) {
  const fromH = (fromIncome / barMax) * 100;
  const toH = (toIncome / barMax) * 100;
  const ticks = [0, 20000, 40000, 60000, 80000, 100000];

  return (
    <div className="relative w-full mt-10">
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col-reverse justify-between pb-1">
        {ticks.map((t) => (
          <span key={t} className="text-xs text-gray-500">
            {t === 0 ? "$0" : `$${t / 1000}k`}
          </span>
        ))}
      </div>
      <div className="ml-14 flex items-end gap-8 h-52">
        <div className="flex flex-col items-center flex-1 h-full justify-end">
          <span className="text-base font-bold text-white mb-1">
            {fmt(fromIncome)}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-1000"
            style={{ height: `${fromH}%`, backgroundColor: "#c7a481" }}
          />
          <span className="text-xs text-gray-400 mt-1">{fromCity}</span>
        </div>
        <div className="flex flex-col items-center flex-1 h-full justify-end">
          <span className="text-base font-bold text-white mb-1">
            {fmt(toIncome)}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-1000"
            style={{ height: `${toH}%`, backgroundColor: "#f5e6d0" }}
          />
          <span className="text-xs text-gray-400 mt-1">{toCity}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ cat, fromCity, toCity }) {
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
              {fromCity}
            </span>
            <span className="text-center text-gray-300">{toCity}</span>
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

  const fromCity = searchParams.get("fromCity") || "California";
  const toCity = searchParams.get("toCity") || "Texas";
  const fromIncome = Number(searchParams.get("income")) || 82000;

  const [dbData, setDbData] = useState({
    fromIdx: 100,
    toIdx: 100,
    updated: "...",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLivingData() {
      try {
        setLoading(true);
        const fromSnap = await getDoc(doc(db, "cost_of_living", fromCity));
        const toSnap = await getDoc(doc(db, "cost_of_living", toCity));
        if (fromSnap.exists() && toSnap.exists()) {
          setDbData({
            fromIdx: fromSnap.data().index,
            toIdx: toSnap.data().index,
            updated: toSnap.data().lastUpdated,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLivingData();
  }, [fromCity, toCity]);

  const processedData = useMemo(() => {
    const ratio = dbData.toIdx / dbData.fromIdx;
    const toIncome = fromIncome * ratio;
    const pctChange = ((toIncome - fromIncome) / fromIncome) * 100;
    const isLower = toIncome < fromIncome;

    return {
      toIncome,
      pct: Math.abs(Math.round(pctChange)),
      dir: isLower ? "lower" : "higher",
      barMax: Math.max(fromIncome, toIncome) * 1.2,
      categories: [
        {
          id: "housing",
          label: "Housing",
          icon: Home,
          pct: Math.abs(Math.round(pctChange * 1.1)),
          dir: isLower ? "lower" : "higher",
          rows: [
            { label: "Median Rent", from: 2400, to: 2400 * ratio },
            { label: "Home Price", from: 650000, to: 650000 * ratio },
          ],
        },
        {
          id: "transportation",
          label: "Transportation",
          icon: Car,
          pct: Math.abs(Math.round(pctChange * 0.95)),
          dir: isLower ? "lower" : "higher",
          rows: [
            { label: "Gas (Gal)", from: 4.5, to: 4.5 * ratio },
            { label: "Insurance", from: 150, to: 150 * ratio },
          ],
        },
        {
          id: "food",
          label: "Food & Dining",
          icon: UtensilsCrossed,
          pct: Math.abs(Math.round(pctChange * 0.9)),
          dir: isLower ? "lower" : "higher",
          rows: [
            { label: "Groceries", from: 550, to: 550 * ratio },
            { label: "Restaurant", from: 30, to: 30 * ratio },
          ],
        },
        {
          id: "health",
          label: "Health Care",
          icon: HeartPulse,
          pct: Math.abs(Math.round(pctChange * 1.05)),
          dir: isLower ? "lower" : "higher",
          rows: [
            { label: "Doctor Visit", from: 120, to: 120 * ratio },
            { label: "Medication", from: 60, to: 60 * ratio },
          ],
        },
        {
          id: "entertainment",
          label: "Entertainment",
          icon: Smile,
          pct: Math.abs(Math.round(pctChange * 0.85)),
          dir: isLower ? "lower" : "higher",
          rows: [
            { label: "Movie Ticket", from: 15, to: 15 * ratio },
            { label: "Gym Member", from: 50, to: 50 * ratio },
          ],
        },
      ],
    };
  }, [dbData, fromIncome]);

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-[#c7a481]">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen text-white bg-[#1a1a1a]">
      <div className="w-full px-5 py-8 lg:px-8 lg:py-12">
        <div className="flex justify-between items-center mb-6">
          <GoodMorning />
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            Verified: {dbData.updated}
          </span>
        </div>
        <div className="my-10">
          <h1 className="text-4xl font-bold mb-4">
            Translate your{" "}
            <span className="text-[#c7a481]">cost of living</span>
          </h1>
        </div>

        <div className="md:flex items-start gap-10">
          <div className="w-full flex-1">
            <CityCard
              fromCity={fromCity}
              toCity={toCity}
              income={fromIncome}
              onEdit={() => router.back()}
            />
            <div className="mt-8 mb-2">
              <p className="text-gray-400 text-sm my-5">
                In {toCity}, you'll need a household income of
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#c7a481]">
                  <CountUp target={processedData.toIncome} />
                </h2>
                <span
                  className={`text-sm font-bold px-3 py-1.5 rounded-full ${processedData.dir === "lower" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                >
                  {processedData.dir === "lower" ? "↓" : "↑"}{" "}
                  {processedData.pct}%
                </span>
              </div>
            </div>
            <IncomeBarChart
              fromCity={fromCity}
              toCity={toCity}
              fromIncome={fromIncome}
              toIncome={processedData.toIncome}
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
                  fromCity={fromCity}
                  toCity={toCity}
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
                `/living/custom-calculator?fromCity=${fromCity}&toCity=${toCity}&income=${fromIncome}`,
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
