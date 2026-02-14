/* eslint-disable react/no-unescaped-entities */
// app/retirement/detail/page.jsx

"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, ChevronDown, ChevronUp } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const fmtK = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
};

// ─── Retirement calculation ───────────────────────────────────────────────────
function calcRetirement({ currentAge, retirementAge, income, savings, contribution, budget, incomeIncrease, inflationRate }) {
  const annualReturn  = 0.07;
  const inflRate      = inflationRate  / 100;
  const incRate       = incomeIncrease / 100;
  const yearsToRetire = retirementAge - currentAge;

  let projected    = savings;
  let monthlyC     = contribution;
  for (let y = 0; y < yearsToRetire; y++) {
    projected = projected * (1 + annualReturn) + monthlyC * 12;
    monthlyC  = monthlyC * (1 + incRate);
  }

  const inflatedBudget = budget * Math.pow(1 + inflRate, yearsToRetire);
  const needed         = inflatedBudget * 25;

  let remaining = projected;
  let ageRunOut = retirementAge;
  while (remaining > 0 && ageRunOut < 120) {
    remaining = remaining * 1.04 - inflatedBudget;
    ageRunOut++;
  }

  return {
    projectedSavings: Math.round(projected),
    needed:           Math.round(needed),
    contribution:     Math.round(monthlyC),
    neededContrib:    Math.round(monthlyC * 1.1),
    ageRunOut:        Math.min(ageRunOut, 99),
  };
}

// Build 2-series chart data: projected vs needed
function buildChartData({ currentAge, retirementAge, savings, contribution, budget, incomeIncrease, inflationRate }) {
  const ages     = Array.from({ length: 71 }, (_, i) => 20 + i);
  const incRate  = incomeIncrease / 100;
  const inflRate = inflationRate  / 100;

  // Series 1: projected savings (7% return)
  let val1 = 0, monthlyC = contribution;
  const projected = ages.map((age) => {
    if (age === currentAge) val1 = savings;
    if (age >= currentAge && age < retirementAge) {
      val1     = val1 * 1.07 + monthlyC * 12;
      monthlyC = monthlyC * (1 + incRate);
    } else if (age >= retirementAge) {
      const annualBudget = budget * Math.pow(1 + inflRate, retirementAge - currentAge);
      val1 = Math.max(0, val1 * 1.04 - annualBudget);
    }
    return { age, val: Math.round(Math.max(0, val1)) };
  });

  // Series 2: needed amount (straight line to needed, then declines)
  const needed = budget * Math.pow(1 + inflRate, retirementAge - currentAge) * 25;
  const needed2 = ages.map((age) => {
    if (age < currentAge) return { age, val: 0 };
    const progress = Math.min((age - currentAge) / (retirementAge - currentAge), 1);
    if (age <= retirementAge) return { age, val: Math.round(needed * progress * 0.9) };
    const postYears = age - retirementAge;
    const annualBudget = budget * Math.pow(1 + inflRate, retirementAge - currentAge);
    let v = needed;
    for (let i = 0; i < postYears; i++) v = Math.max(0, v * 1.04 - annualBudget * 1.5);
    return { age, val: Math.round(v) };
  });

  const allVals = [...projected, ...needed2].map((p) => p.val);
  const maxVal  = Math.max(...allVals);

  return { projected, needed: needed2, maxVal };
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ currentAge, income, contribution, retirementAge, onEdit }) {
  return (
    <div className="rounded-2xl p-4 " style={{ backgroundColor: "#2a2a2a" }}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📅</span>
            <span>Current Age: <span className="text-white font-semibold">{currentAge}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📈</span>
            <span>Pre-Tax Income: <span className="text-white font-semibold">{fmt(income)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">💰</span>
            <span>Contribution: <span className="text-white font-semibold">{fmt(contribution)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📅</span>
            <span>Retirement Age: <span className="text-white font-semibold">{retirementAge}</span></span>
          </div>
        </div>
        <button onClick={onEdit} className="text-gray-400 hover:text-white transition-colors">
          <Pencil size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Analysis accordion ───────────────────────────────────────────────────────
function AnalysisAccordion({ retirementAge, projectedSavings, needed, contribution, neededContrib, ageRunOut }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#2a2a2a" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a1a1a" }}>
            <span className="text-sm">💼</span>
          </div>
          <span className="text-white font-semibold text-sm">
            Retirement Savings at age {retirementAge}
          </span>
        </div>
        {open
          ? <ChevronUp size={16} className="text-gray-500" />
          : <ChevronDown size={16} className="text-gray-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-3 text-xs mb-3 border-t border-white/5 pt-4">
            <span />
            <span className="text-center font-semibold" style={{ color: "#c7a481" }}>You'll Have</span>
            <span className="text-center font-semibold text-gray-300">You'll Need</span>
          </div>
          {[
            { label: "Total Savings",      have: fmt(projectedSavings), need: fmt(needed)        },
            { label: "Contribution",       have: fmt(contribution),     need: fmt(neededContrib)  },
            { label: "Age Savings Run Out",have: ageRunOut,             need: 95                  },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-3 items-center py-2.5 border-b border-white/5 last:border-0">
              <span className="text-xs text-gray-400 leading-tight pr-2">{row.label}</span>
              <span className="text-center text-sm font-semibold" style={{ color: "#c7a481" }}>{row.have}</span>
              <span className="text-center text-sm font-semibold text-gray-200">{row.need}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SVG Chart ────────────────────────────────────────────────────────────────
function RetirementChart({ chartData, retirementAge }) {
  const W = 340, H = 180, PL = 44, PR = 8, PT = 24, PB = 26;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;

  const ages   = chartData.projected.map((p) => p.age);
  const minAge = ages[0], maxAge = ages[ages.length - 1];
  const maxVal = chartData.maxVal || 2_000_000;

  const xS = (age) => ((age - minAge) / (maxAge - minAge)) * innerW;
  const yS = (val) => innerH - (val / maxVal) * innerH;

  const toPath = (pts) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${xS(p.age).toFixed(1)},${yS(p.val).toFixed(1)}`).join(" ");

  // Peak of projected series
  const peak = chartData.projected.reduce((a, b) => (b.val > a.val ? b : a));

  const yTicks = [0, 500000, 1000000, 1500000, 2000000];

  return (
    <div className="rounded-2xl mt-4 overflow-hidden" style={{ backgroundColor: "#2a2a2a", padding: "16px 12px 12px" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <g transform={`translate(${PL},${PT})`}>
          {/* Grid */}
          {yTicks.map((t) => (
            <line key={t} x1={0} y1={yS(t)} x2={innerW} y2={yS(t)} stroke="#333" strokeWidth={0.5} />
          ))}

          {/* Needed line (dark red) */}
          <path
            d={toPath(chartData.needed)}
            fill="none"
            stroke="#8b1c1c"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Projected line (gold) */}
          <path
            d={toPath(chartData.projected)}
            fill="none"
            stroke="#c7a481"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Peak pill */}
          <circle cx={xS(peak.age)} cy={yS(peak.val)} r={3.5} fill="#8b1c1c" stroke="#1a1a1a" strokeWidth={1} />
          <rect
            x={xS(peak.age) - 30} y={yS(peak.val) - 22}
            width={60} height={16} rx={4} fill="#8b1c1c"
          />
          <text
            x={xS(peak.age)} y={yS(peak.val) - 10}
            textAnchor="middle" fill="#fff" fontSize={7} fontWeight="bold"
          >
            {fmtK(peak.val)}
          </text>

          {/* Y axis */}
          {yTicks.map((t) => (
            <text key={t} x={-5} y={yS(t) + 3} textAnchor="end" fill="#555" fontSize={7}>
              {t === 0 ? "$0" : `$${t / 1_000_000 >= 1 ? t / 1_000_000 + "m" : t / 1000 + "k"}`}
            </text>
          ))}

          {/* X axis */}
          {[20, 30, 40, 50, 60, 70, 80, 90].map((age) => (
            <text key={age} x={xS(age)} y={innerH + 14} textAnchor="middle" fill="#555" fontSize={7}>
              {age}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ─── Performance table ────────────────────────────────────────────────────────
const ACCOUNTS = [
  { type: "Traditional", taxBenefits: "Deferred",    growth: "$350K", liquidity: "Mod.",     fees: "Low"  },
  { type: "Savings",     taxBenefits: "Taxable",     growth: "$150K", liquidity: "High",     fees: "None" },
  { type: "FIA",         taxBenefits: "Advantaged",  growth: "$375K", liquidity: "Low",      fees: "Mod." },
  { type: "IUL",         taxBenefits: "Advantaged",  growth: "$400K", liquidity: "Mod.",     fees: "High" },
];

function PerformanceTable() {
  return (
    <div className="mt-6">
      <p className="text-sm font-bold text-white mb-3">Performance Comparison</p>
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#2a2a2a" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {["Account Type", "Tax Benefits", "Growth", "Liquidity", "Fees"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "#c7a481" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((row) => (
                <tr key={row.type} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-white font-medium">{row.type}</td>
                  <td className="px-4 py-3 text-gray-300">{row.taxBenefits}</td>
                  <td className="px-4 py-3 text-gray-200">{row.growth}</td>
                  <td className="px-4 py-3 text-gray-300">{row.liquidity}</td>
                  <td className="px-4 py-3 text-gray-300">{row.fees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function RetirementDetailInner() {
  const router = useRouter();
  const params = useSearchParams();

  const currentAge     = Number(params.get("currentAge")     || 35);
  const income         = Number(params.get("income")         || 60000);
  const savings        = Number(params.get("savings")        || 150000);
  const contribution   = Number(params.get("contribution")   || 500);
  const budget         = Number(params.get("budget")         || 60000);
  const retirementAge  = Number(params.get("retirementAge")  || 67);
  const incomeIncrease = Number(params.get("incomeIncrease") || 3);
  const inflationRate  = Number(params.get("inflationRate")  || 2.5);

  const result = useMemo(() => calcRetirement({
    currentAge, retirementAge, income, savings,
    contribution, budget, incomeIncrease, inflationRate,
  }), [currentAge, retirementAge, income, savings, contribution, budget, incomeIncrease, inflationRate]);

  const chartData = useMemo(() => buildChartData({
    currentAge, retirementAge, savings, contribution,
    budget, incomeIncrease, inflationRate,
  }), [currentAge, retirementAge, savings, contribution, budget, incomeIncrease, inflationRate]);

  const editUrl = `/retirement?currentAge=${currentAge}&income=${income}&savings=${savings}&contribution=${contribution}&budget=${budget}&retirementAge=${retirementAge}&incomeIncrease=${incomeIncrease}&inflationRate=${inflationRate}`;

  const handleExport = () => {
    const lines = [
      "Retirement Analysis",
      `Current Age,${currentAge}`,
      `Retirement Age,${retirementAge}`,
      `Annual Income,${income}`,
      `Monthly Contribution,${contribution}`,
      `Current Savings,${savings}`,
      `Projected Savings,${result.projectedSavings}`,
      `Amount Needed,${result.needed}`,
      `Age Savings Run Out,${result.ageRunOut}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "retirement-analysis.csv"; a.click();
    URL.revokeObjectURL(url);
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
        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-6">
          Your <span className="text-[#c7a481]">retirement</span>
          <br />options results
        </h1>

        {/* Summary card */}
        <SummaryCard
          currentAge={currentAge}
          income={income}
          contribution={contribution}
          retirementAge={retirementAge}
          onEdit={() => router.push(editUrl)}
        />

        {/* Learn how link */}
        <button className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: "#c7a481" }}>
          <span>●</span>
          Learn how we calculated your results
        </button>

        {/* Analysis label */}
        <p className="mt-6 mb-3 text-sm font-bold text-white">Analysis</p>

        {/* Accordion */}
        <AnalysisAccordion
          retirementAge={retirementAge}
          projectedSavings={result.projectedSavings}
          needed={result.needed}
          contribution={result.contribution}
          neededContrib={result.neededContrib}
          ageRunOut={result.ageRunOut}
        />

        {/* Chart */}
        <RetirementChart chartData={chartData} retirementAge={retirementAge} />

        {/* Performance table */}
        <PerformanceTable />

        {/* Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => alert("Saved!")}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#8b1c1c" }}
          >
            Save
          </button>
          <button
            onClick={handleExport}
            className="w-full py-4 rounded-2xl font-bold text-base border transition-all hover:bg-white/5 active:scale-[0.98]"
            style={{ backgroundColor: "transparent", borderColor: "#c7a481", color: "#c7a481" }}
          >
            Export
          </button>
          <button
            onClick={() => router.push("/retirement")}
            className="w-full py-4 rounded-2xl font-bold text-base border transition-all hover:bg-white/5 active:scale-[0.98]"
            style={{ backgroundColor: "transparent", borderColor: "#3a3a3a", color: "#aaa" }}
          >
            Start over
          </button>
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}

export default function RetirementDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <RetirementDetailInner />
    </Suspense>
  );
}