// app/stocks/detail/page.jsx

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

const PLAN_LABELS = {
  espp: "ESPP",
  rsu:  "RSU",
  iso:  "ISO",
  nso:  "NSO",
  sar:  "SAR",
};

// ─── Calculation ──────────────────────────────────────────────────────────────
function calcStocks({ shares, marketValue, costOfShare, taxRate, capitalGainsRate }) {
  const grossSaleValue       = shares * marketValue;
  const costBasis            = shares * costOfShare;
  const taxableOrdinaryIncome = grossSaleValue - costBasis;
  const totalTaxableIncome   = taxableOrdinaryIncome;
  const ordinaryIncomeTax    = totalTaxableIncome * (taxRate / 100);
  const capitalGainsTax      = costBasis * (capitalGainsRate / 100);
  const netEarnings          = grossSaleValue - ordinaryIncomeTax - capitalGainsTax;

  return {
    grossSaleValue:        Math.round(grossSaleValue),
    costBasis:             Math.round(costBasis),
    taxableOrdinaryIncome: Math.round(taxableOrdinaryIncome),
    totalTaxableIncome:    Math.round(totalTaxableIncome),
    netEarnings:           Math.round(netEarnings),
    ordinaryIncomeTax:     Math.round(ordinaryIncomeTax),
    capitalGainsTax:       Math.round(capitalGainsTax),
    shares,
    marketValue,
  };
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ stockPlan, stockSymbol, shares, exerciseDate, costOfShare, taxRate, onEdit }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#2a2a2a" }}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📋</span>
            <span>Stock Plan: <span className="text-white font-semibold">{PLAN_LABELS[stockPlan] ?? stockPlan}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📈</span>
            <span>Stock Symbol: <span className="text-white font-semibold">{stockSymbol}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">🔢</span>
            <span>Shares: <span className="text-white font-semibold">{shares} shares</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📅</span>
            <span>Exercise Date: <span className="text-white font-semibold">{exerciseDate}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">🛒</span>
            <span>Purchase Price: <span className="text-white font-semibold">{fmt(costOfShare)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">🏷️</span>
            <span>Income Tax Rate: <span className="text-white font-semibold">{taxRate}%</span></span>
          </div>
        </div>
        <button onClick={onEdit} className="text-gray-400 hover:text-white transition-colors">
          <Pencil size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Single accordion row ─────────────────────────────────────────────────────
function AccordionRow({ label, value, isFirst, formula }) {
  const [open, setOpen] = useState(isFirst);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#2a2a2a" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-semibold text-sm">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: "#c7a481" }}>{value}</span>
          {open
            ? <ChevronUp size={16} className="text-gray-500" />
            : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>

      {open && formula && (
        <div className="px-5 pb-4 border-t border-white/5">
          <p className="text-xs text-gray-500 mt-3">{formula.description}</p>
          <p className="text-xs font-semibold mt-1" style={{ color: "#c7a481" }}>
            {formula.calculation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Donut chart (pure SVG) ───────────────────────────────────────────────────
function DonutChart({ netEarnings, ordinaryIncomeTax, capitalGainsTax }) {
  const total = netEarnings + ordinaryIncomeTax + capitalGainsTax;

  const segments = [
    { label: "Net Earnings",        value: netEarnings,       color: "#f5e6d0" },
    { label: "Capital Gains Tax",   value: capitalGainsTax,   color: "#c7a481" },
    { label: "Ordinary Income Tax", value: ordinaryIncomeTax, color: "#8b1c1c" },
  ];

  // Bigger + centered
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;        // bigger outer radius
  const innerR = 70;    // bigger inner radius

  let currentAngle = -Math.PI / 2;

  const paths = segments.map((seg) => {
    const fraction = seg.value / total;
    const angle = fraction * 2 * Math.PI;

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
    const labelR = (r + innerR) / 2; // place label inside donut

    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    const path = `
      M ${x1} ${y1}
      A ${r} ${r} 0 ${large} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4}
      Z
    `;

    currentAngle += angle;

    return { ...seg, path, lx, ly, fraction };
  });

  return (
    <div className="mt-8 flex flex-col items-center">
      <svg
        width="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-[500px]"
      >
        {paths.map((seg) => (
          <g key={seg.label}>
            <path d={seg.path} fill={seg.color} />
            <text
              x={seg.lx}
              y={seg.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#1a1a1a"
              fontSize={12}
              fontWeight="bold"
            >
              {(seg.fraction * 100).toFixed(1)}%
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-gray-300">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Page inner ───────────────────────────────────────────────────────────────
function StocksDetailInner() {
  const router = useRouter();
  const params = useSearchParams();

  const stockPlan        = params.get("stockPlan")        || "nso";
  const stockSymbol      = params.get("stockSymbol")      || "ABC";
  const shares           = Number(params.get("shares")           || 100);
  const exerciseDate     = params.get("exerciseDate")     || "2024-12-31";
  const costOfShare      = Number(params.get("costOfShare")      || 90);
  const marketValue      = Number(params.get("marketValue")      || 90);
  const taxRate          = Number(params.get("taxRate")          || 22);
  const capitalGainsRate = Number(params.get("capitalGainsRate") || 15);

  const result = useMemo(() => calcStocks({
    shares, marketValue, costOfShare, taxRate, capitalGainsRate,
  }), [shares, marketValue, costOfShare, taxRate, capitalGainsRate]);

  const editUrl = `/stocks?stockPlan=${stockPlan}&stockSymbol=${stockSymbol}&shares=${shares}&exerciseDate=${exerciseDate}&costOfShare=${costOfShare}&marketValue=${marketValue}&taxRate=${taxRate}&capitalGainsRate=${capitalGainsRate}`;

  const handleExport = () => {
    const lines = [
      "Stock Plan Analysis",
      `Stock Plan,${stockPlan}`,
      `Stock Symbol,${stockSymbol}`,
      `Shares,${shares}`,
      `Exercise Date,${exerciseDate}`,
      `Cost of Share,${costOfShare}`,
      `Market Value,${marketValue}`,
      `Tax Rate,${taxRate}%`,
      `Capital Gains Rate,${capitalGainsRate}%`,
      "",
      `Gross Sale Value,${result.grossSaleValue}`,
      `Cost Basis,${result.costBasis}`,
      `Taxable Ordinary Income,${result.taxableOrdinaryIncome}`,
      `Total Taxable Income,${result.totalTaxableIncome}`,
      `Net Earnings after Tax,${result.netEarnings}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "stock-plan-analysis.csv"; a.click();
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
          Your <span className="text-[#c7a481]">employer<br />stock plan</span> results
        </h1>

        {/* Summary card */}
        <SummaryCard
          stockPlan={stockPlan}
          stockSymbol={stockSymbol}
          shares={shares}
          exerciseDate={exerciseDate}
          costOfShare={costOfShare}
          taxRate={taxRate}
          onEdit={() => router.push(editUrl)}
        />

        {/* Learn how link */}
        <button className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: "#c7a481" }}>
          <span>●</span>
          Learn how we calculated your results
        </button>

        {/* Analysis label */}
        <p className="mt-6 mb-3 text-sm font-bold text-white">Analysis</p>

        {/* Accordion rows */}
        <div className="space-y-3">
          <AccordionRow
            label="Gross Sale Value"
            value={fmt(result.grossSaleValue)}
            isFirst={true}
            formula={{
              description: "Number of shares * Sales price",
              calculation: `${shares} * $${marketValue} = ${fmt(result.grossSaleValue)}`,
            }}
          />
          <AccordionRow
            label="Cost Basis"
            value={fmt(result.costBasis)}
            formula={{
              description: "Number of shares * Cost per share",
              calculation: `${shares} * $${costOfShare} = ${fmt(result.costBasis)}`,
            }}
          />
          <AccordionRow
            label="Taxable Ordinary Income"
            value={fmt(result.taxableOrdinaryIncome)}
            formula={{
              description: "Gross Sale Value - Cost Basis",
              calculation: `${fmt(result.grossSaleValue)} - ${fmt(result.costBasis)} = ${fmt(result.taxableOrdinaryIncome)}`,
            }}
          />
          <AccordionRow
            label="Total Taxable Income"
            value={fmt(result.totalTaxableIncome)}
            formula={{
              description: "Sum of all taxable income components",
              calculation: fmt(result.totalTaxableIncome),
            }}
          />
          <AccordionRow
            label="Net Earnings after Tax"
            value={fmt(result.netEarnings)}
            formula={{
              description: "Gross Sale Value - Ordinary Income Tax - Capital Gains Tax",
              calculation: `${fmt(result.grossSaleValue)} - ${fmt(result.ordinaryIncomeTax)} - ${fmt(result.capitalGainsTax)} = ${fmt(result.netEarnings)}`,
            }}
          />
        </div>

        {/* Donut chart */}
        <DonutChart
          netEarnings={result.netEarnings}
          ordinaryIncomeTax={result.ordinaryIncomeTax}
          capitalGainsTax={result.capitalGainsTax}
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
            onClick={() => router.push("/stocks")}
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

export default function StocksDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <StocksDetailInner />
    </Suspense>
  );
}