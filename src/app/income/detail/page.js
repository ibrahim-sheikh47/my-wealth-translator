// app/income/detail/page.jsx

"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

// ─── Calculation ──────────────────────────────────────────────────────────────
function calcIncome({ preTaxIncome, desiredAfterTaxIncome, timeFrame, savings, taxRate, inflationRate }) {
  const taxDecimal  = taxRate      / 100;
  const inflDecimal = inflationRate / 100;

  // Total needed = desired after-tax income * 25x (perpetuity rule), inflation-adjusted
  const inflationAdjustedTarget = desiredAfterTaxIncome * Math.pow(1 + inflDecimal, timeFrame);
  const totalNeeded             = inflationAdjustedTarget * 25;
  const additionalNeeded        = Math.max(0, totalNeeded - savings);

  // Tax impact = portion of total eaten by tax
  const taxImpact      = totalNeeded * taxDecimal;
  // Inflation impact = portion eaten by inflation
  const inflationImpact = totalNeeded * inflDecimal * timeFrame * 0.5;
  // Net savings = what's left
  const netSavings     = Math.max(0, totalNeeded - taxImpact - inflationImpact);

  const total = netSavings + inflationImpact + taxImpact;

  return {
    totalNeeded:    Math.round(totalNeeded),
    netSavings:     Math.round(netSavings),
    inflationImpact: Math.round(inflationImpact),
    taxImpact:      Math.round(taxImpact),
    total:          Math.round(total),
    netPct:         Math.round((netSavings / total) * 100),
    inflPct:        Math.round((inflationImpact / total) * 100),
    taxPct:         Math.round((taxImpact / total) * 100),
  };
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ preTaxIncome, desiredAfterTaxIncome, timeFrame, savings, onEdit }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#2a2a2a" }}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">💵</span>
            <span>Pre-tax Income: <span className="text-white font-semibold">{fmt(preTaxIncome)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">💸</span>
            <span>After-tax Income: <span className="text-white font-semibold">{fmt(desiredAfterTaxIncome)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">⏱️</span>
            <span>Time Frame: <span className="text-white font-semibold">{timeFrame} years</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">🏦</span>
            <span>Current Savings: <span className="text-white font-semibold">{fmt(savings)}</span></span>
          </div>
        </div>
        <button onClick={onEdit} className="text-gray-400 hover:text-white transition-colors">
          <Pencil size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Value pill (gold box with icon) ─────────────────────────────────────────
function ValuePill({ icon, value }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{ backgroundColor: "#2a2a2a" }}
    >
      <span className="text-base">{icon}</span>
      <span className="text-xl font-extrabold text-white">{value}</span>
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ netPct, inflPct, taxPct }) {
  const segments = [
    { label: "Net Savings",      pct: netPct,  color: "#f5e6d0" },
    { label: "Inflation Impact", pct: inflPct, color: "#c7a481" },
    { label: "Tax Impact",       pct: taxPct,  color: "#8b1c1c" },
  ];

  const cx = 85, cy = 85, r = 60, innerR = 38;
  let currentAngle = -Math.PI / 2;

  const paths = segments.map((seg) => {
    const fraction = seg.pct / 100;
    const angle    = fraction * 2 * Math.PI;
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(currentAngle + angle);
    const y2 = cy + r * Math.sin(currentAngle + angle);
    const x3 = cx + innerR * Math.cos(currentAngle + angle);
    const y3 = cy + innerR * Math.sin(currentAngle + angle);
    const x4 = cx + innerR * Math.cos(currentAngle);
    const y4 = cy + innerR * Math.sin(currentAngle);
    const large = angle > Math.PI ? 1 : 0;

    const midAngle = currentAngle + angle / 2;
    const labelR   = (r + innerR) / 2 + 12;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
    currentAngle += angle;
    return { ...seg, path, lx, ly };
  });

  return (
    <div className="mt-8 flex flex-col items-center">
      <svg width={170} height={170} viewBox="0 0 170 170">
        {paths.map((seg) => (
          <g key={seg.label}>
            <path d={seg.path} fill={seg.color} />
            <text
              x={seg.lx} y={seg.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={seg.color === "#f5e6d0" ? "#1a1a1a" : "#fff"}
              fontSize={8}
              fontWeight="bold"
            >
              {seg.pct}%
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-gray-300">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page inner ───────────────────────────────────────────────────────────────
function IncomeDetailInner() {
  const router = useRouter();
  const params = useSearchParams();

  const preTaxIncome          = Number(params.get("preTaxIncome")          || 75000);
  const desiredAfterTaxIncome = Number(params.get("desiredAfterTaxIncome") || 60000);
  const timeFrame             = Number(params.get("timeFrame")             || 10);
  const savings               = Number(params.get("savings")               || 50000);
  const taxRate               = Number(params.get("taxRate")               || 20);
  const inflationRate         = Number(params.get("inflationRate")         || 3);

  const result = useMemo(() => calcIncome({
    preTaxIncome, desiredAfterTaxIncome, timeFrame, savings, taxRate, inflationRate,
  }), [preTaxIncome, desiredAfterTaxIncome, timeFrame, savings, taxRate, inflationRate]);

  const editUrl = `/income?preTaxIncome=${preTaxIncome}&desiredAfterTaxIncome=${desiredAfterTaxIncome}&timeFrame=${timeFrame}&savings=${savings}&taxRate=${taxRate}&inflationRate=${inflationRate}`;

  const handleExport = () => {
    const lines = [
      "Income & Savings Analysis",
      `Pre-Tax Income,${preTaxIncome}`,
      `Desired After-Tax Income,${desiredAfterTaxIncome}`,
      `Time Frame,${timeFrame} years`,
      `Current Savings,${savings}`,
      `Tax Rate,${taxRate}%`,
      `Inflation Rate,${inflationRate}%`,
      "",
      `Total Savings Needed,${result.totalNeeded}`,
      `Net Savings,${result.netSavings}`,
      `Inflation Impact,${result.inflationImpact}`,
      `Tax Impact,${result.taxImpact}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "income-analysis.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="max-w-2xl mx-auto px-5 py-8 lg:px-8 lg:py-12">

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
          Your <span className="text-[#c7a481]">income and<br />savings</span> results
        </h1>

        {/* Summary card */}
        <SummaryCard
          preTaxIncome={preTaxIncome}
          desiredAfterTaxIncome={desiredAfterTaxIncome}
          timeFrame={timeFrame}
          savings={savings}
          onEdit={() => router.push(editUrl)}
        />

        {/* Learn how link */}
        <button className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: "#c7a481" }}>
          <span>●</span>
          Learn how we calculated your results
        </button>

        {/* Analysis section */}
        <p className="mt-6 mb-5 text-sm font-bold text-white">Analysis</p>

        {/* Text + value blocks */}
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            To achieve your desired after-tax income of
          </p>
          <ValuePill icon="💸" value={fmt(desiredAfterTaxIncome)} />

          <p className="text-sm text-gray-300 pt-1">
            you will need to save
          </p>
          <ValuePill icon="🐖" value={fmt(result.totalNeeded)} />

          <p className="text-sm text-gray-300 pt-1">
            accounting for tax and inflation rates of
          </p>

          {/* TAX + INFLATION pills */}
          <div className="flex items-center gap-3">
            <div
              className="flex flex-col items-center px-4 py-2 rounded-xl"
              style={{ backgroundColor: "#2a2a2a" }}
            >
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">TAX</span>
              <span className="text-xl font-extrabold text-white">{taxRate}%</span>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 rounded-xl"
              style={{ backgroundColor: "#8b1c1c" }}
            >
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider">INFLATION</span>
              <span className="text-xl font-extrabold text-white">{inflationRate}%</span>
            </div>
          </div>
        </div>

        {/* Donut chart */}
        <DonutChart
          netPct={result.netPct}
          inflPct={result.inflPct}
          taxPct={result.taxPct}
        />

        {/* Action buttons */}
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
            onClick={() => router.push("/income")}
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

export default function IncomeDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <IncomeDetailInner />
    </Suspense>
  );
}