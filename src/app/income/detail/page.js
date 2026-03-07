// app/income/detail/page.jsx

"use client";

import { Suspense, useMemo, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Pencil, Download, RotateCcw, BookOpen, ArrowLeft } from "lucide-react";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import GoodMorning from "@/app/components/GoodMorning";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// ─── Corrected Helpers ────────────────────────────────────────────────────────

function getWithdrawalMultiplier(timeFrame, baseMultiple) {
  // Logic: The shorter the saving timeframe, the more aggressive the withdrawal
  // rule tends to be (assuming shorter retirement or higher tolerance).
  if (timeFrame <= 10) return Math.round(baseMultiple * 0.8); // 20x
  if (timeFrame <= 20) return baseMultiple;                  // 25x
  if (timeFrame <= 35) return Math.round(baseMultiple * 1.14); // 28x
  return Math.round(baseMultiple * 1.32);                     // 33x
}

function calcIncome({ desiredAfterTaxIncome, timeFrame, savings, taxRate, inflationRate, baseMultiple }) {
  const taxDecimal = taxRate / 100;
  const inflDecimal = inflationRate / 100;

  // 1. Calculate how much $60k is worth in 10 years (Future Annual Need)
  const annualTargetInflationAdjusted = desiredAfterTaxIncome * Math.pow(1 + inflDecimal, timeFrame);

  // 2. Calculate Gross Withdrawal (What you must pull out to have the Target left after tax)
  const annualGrossNeeded = annualTargetInflationAdjusted / (1 - taxDecimal);

  // 3. Apply the Withdrawal Rule (The "Multiplier") to find the total "Pile"
  const withdrawalMultiplier = getWithdrawalMultiplier(timeFrame, baseMultiple);
  const totalNeeded = annualGrossNeeded * withdrawalMultiplier;

  // 4. Calculate Additional Savings Gap
  const additionalNeeded = Math.max(0, totalNeeded - savings);

  // ─── BREAKDOWN FOR THE DONUT CHART ───

  // A. The "Pure" Savings (Cost if Tax and Inflation were 0%)
  const pureSavingsTerm = (desiredAfterTaxIncome * withdrawalMultiplier);

  // B. Tax Impact (The portion of the total pile existing solely to pay future taxes)
  const taxImpact = totalNeeded * taxDecimal;

  // C. Inflation Impact (The portion of the pile existing solely to cover rising costs)
  const inflationImpact = totalNeeded - taxImpact - pureSavingsTerm;

  // D. Net Savings (The actual "buying power" value)
  const netSavings = pureSavingsTerm;

  const total = netSavings + inflationImpact + taxImpact;

  return {
    totalNeeded: Math.round(totalNeeded),
    additionalNeeded: Math.round(additionalNeeded),
    netSavings: Math.round(netSavings),
    inflationImpact: Math.round(inflationImpact),
    taxImpact: Math.round(taxImpact),
    total: Math.round(total),
    netPct: Math.round((netSavings / total) * 100),
    inflPct: Math.round((inflationImpact / total) * 100),
    taxPct: Math.round((taxImpact / total) * 100),
    withdrawalMultiplier,
  };
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ netPct, inflPct, taxPct }) {
  const segments = [
    { label: "Net Savings", pct: netPct, color: "#f5e6d0" },
    { label: "Inflation Impact", pct: inflPct, color: "#c7a481" },
    { label: "Tax Impact", pct: taxPct, color: "#8b1c1c" },
  ];
  const cx = 100, cy = 100, r = 72, innerR = 46;
  let currentAngle = -Math.PI / 2;
  const paths = segments.map((seg) => {
    const fraction = seg.pct / 100;
    const angle = fraction * 2 * Math.PI;
    const x1 = cx + r * Math.cos(currentAngle), y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(currentAngle + angle), y2 = cy + r * Math.sin(currentAngle + angle);
    const x3 = cx + innerR * Math.cos(currentAngle + angle), y3 = cy + innerR * Math.sin(currentAngle + angle);
    const x4 = cx + innerR * Math.cos(currentAngle), y4 = cy + innerR * Math.sin(currentAngle);
    const large = angle > Math.PI ? 1 : 0;
    const midAngle = currentAngle + angle / 2;
    const labelR = r + 18;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
    currentAngle += angle;
    return { ...seg, path, lx: cx + labelR * Math.cos(midAngle), ly: cy + labelR * Math.sin(midAngle) };
  });
  return (
    <div className="flex flex-col items-center">
      <svg width={200} height={200} viewBox="0 0 200 200">
        {paths.map((seg) => (
          <g key={seg.label}>
            <path d={seg.path} fill={seg.color} />
            {seg.pct > 5 && (
              <text
                x={seg.lx} y={seg.ly}
                textAnchor="middle" dominantBaseline="middle"
                fill="#ffffff"
                fontSize={11}
                fontWeight="bold"
              >
                {seg.pct}%
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-zinc-400">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, sub }) {
  return (
    <div className="bg-[#242424] border border-[#333] rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-zinc-500 text-xs uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-bold ${accent ? "text-[#c7a481]" : "text-white"}`}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2a2a2a] last:border-0">
      <div className="flex items-center gap-2 text-zinc-400 text-sm"><span>{icon}</span><span>{label}</span></div>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );
}

// ─── Page inner ───────────────────────────────────────────────────────────────
function IncomeDetailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const user   = useSelector((state) => state.auth.user);

  const preTaxIncome          = Number(params.get("preTaxIncome"));
  const desiredAfterTaxIncome = Number(params.get("desiredAfterTaxIncome"));
  const timeFrame             = Number(params.get("timeFrame"));
  const savings               = Number(params.get("savings"));
  const taxRate               = Number(params.get("taxRate"));
  const inflationRate         = Number(params.get("inflationRate"));

  const [baseMultiple, setBaseMultiple] = useState(null);
  // "idle" | "saving" | "saved" | "error"
  const [saveStatus, setSaveStatus]     = useState("idle");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const ref  = doc(db, "income_config", "constants");
        const snap = await getDoc(ref);
        if (snap.exists()) setBaseMultiple(snap.data().withdrawal_rule_multiple);
      } catch (err) {
        console.error("Failed to fetch income config:", err);
        setBaseMultiple(25);
      }
    }
    fetchConfig();
  }, []);

  const result = useMemo(() => {
    if (baseMultiple === null) return null;
    return calcIncome({ preTaxIncome, desiredAfterTaxIncome, timeFrame, savings, taxRate, inflationRate, baseMultiple });
  }, [preTaxIncome, desiredAfterTaxIncome, timeFrame, savings, taxRate, inflationRate, baseMultiple]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <span className="text-zinc-500 text-sm animate-pulse">Loading your results…</span>
      </div>
    );
  }

  const editUrl = `/income?preTaxIncome=${preTaxIncome}&desiredAfterTaxIncome=${desiredAfterTaxIncome}&timeFrame=${timeFrame}&savings=${savings}&taxRate=${taxRate}&inflationRate=${inflationRate}`;

  // ── Save to Firestore ───────────────────────────────────────────────────────
  // Stored under: users/{uid}/income_reports/{auto-id}
  const handleSave = async () => {
    if (!user?.uid) { alert("Please log in to save reports."); return; }
    setSaveStatus("saving");
    try {
      await addDoc(collection(db, "users", user.uid, "income_reports"), {
        // All input values — used to pre-fill the form on revisit
        preTaxIncome, desiredAfterTaxIncome, timeFrame, savings, taxRate, inflationRate,
        // Computed summary
        totalNeeded:      result.totalNeeded,
        additionalNeeded: result.additionalNeeded,
        netSavings:       result.netSavings,
        savedAt: serverTimestamp(),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("[handleSave] Firestore error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const saveLabel =
    saveStatus === "saving" ? "Saving…" :
    saveStatus === "saved"  ? "✓ Saved!" :
    saveStatus === "error"  ? "Error — Try Again" : "Save";

  const handleExport = () => {
    const lines = [
      "Income & Savings Analysis",
      `Pre-Tax Income,${preTaxIncome}`,
      `Desired After-Tax Income,${desiredAfterTaxIncome}`,
      `Time Frame,${timeFrame} years`,
      `Current Savings,${savings}`,
      `Tax Rate,${taxRate}%`,
      `Inflation Rate,${inflationRate}%`,
      `Withdrawal Rule,${result.withdrawalMultiplier}x`,
      "",
      `Total Savings Needed,${result.totalNeeded}`,
      `Additional Savings Needed,${result.additionalNeeded}`,
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
      <div className="px-6 py-8 lg:px-12 lg:py-12 max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <GoodMorning />

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
              Your <span className="text-[#c7a481]">income and savings</span> results
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              {timeFrame} year projection · {taxRate}% tax · {inflationRate}% inflation ·{" "}
              <span className="text-[#c7a481] font-semibold">{result.withdrawalMultiplier}x</span> withdrawal rule
            </p>
          </div>
          <button onClick={() => router.push(editUrl)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition border border-[#333] rounded-xl px-4 py-2 mt-1">
            <Pencil size={14} /> Edit inputs
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <div className="space-y-5">
            <div className="bg-[#c7a481] rounded-2xl p-6">
              <p className="text-[#6b4c2a] text-xs uppercase tracking-widest font-semibold mb-1">Total Savings Needed</p>
              <p className="text-4xl font-bold text-[#1a1a1a]">{fmt(result.totalNeeded)}</p>
              <p className="text-[#6b4c2a] text-xs mt-2">To sustain {fmt(desiredAfterTaxIncome)}/yr after-tax in perpetuity</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Additional Needed" value={fmt(result.additionalNeeded)} accent sub={`Above your ${fmt(savings)} savings`} />
              <StatCard label="Net Savings"        value={fmt(result.netSavings)}       sub="After tax & inflation" />
              <StatCard label="Tax Impact"         value={fmt(result.taxImpact)}        sub={`At ${taxRate}% tax rate`} />
              <StatCard label="Inflation Impact"   value={fmt(result.inflationImpact)}  sub={`At ${inflationRate}% over ${timeFrame}yr`} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#242424] border border-[#333] rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Tax Rate</span>
                <span className="text-3xl font-extrabold text-white">{taxRate}%</span>
              </div>
              <div className="bg-[#8b1c1c] border border-[#a02020] rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs font-bold text-red-300 uppercase tracking-wider mb-1">Inflation</span>
                <span className="text-3xl font-extrabold text-white">{inflationRate}%</span>
              </div>
              <div className="bg-[#1e2d1e] border border-[#2a3f2a] rounded-2xl p-4 flex flex-col items-center">
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Rule</span>
                <span className="text-3xl font-extrabold text-white">{result.withdrawalMultiplier}x</span>
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 bg-[#8b1c1c]"
              >
                {saveLabel}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm border border-[#c7a481] text-[#c7a481] hover:bg-[#c7a481]/10 transition"
                >
                  <Download size={16} /> Export CSV
                </button>
                <button
                  onClick={() => router.push("/income")}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm border border-[#333] text-zinc-400 hover:bg-white/5 transition"
                >
                  <RotateCcw size={16} /> Start over
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <div className="bg-[#242424] border border-[#333] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Your Inputs</h2>
                <button onClick={() => router.push(editUrl)} className="text-zinc-500 hover:text-[#c7a481] transition"><Pencil size={14} /></button>
              </div>
              <SummaryRow icon="💵" label="Pre-tax Income"            value={fmt(preTaxIncome)} />
              <SummaryRow icon="💸" label="Desired After-tax Income"  value={fmt(desiredAfterTaxIncome)} />
              <SummaryRow icon="⏱️" label="Time Frame"                value={`${timeFrame} years`} />
              <SummaryRow icon="🏦" label="Current Savings"           value={fmt(savings)} />
              <SummaryRow icon="📊" label="Tax Rate"                  value={`${taxRate}%`} />
              <SummaryRow icon="📈" label="Inflation Rate"            value={`${inflationRate}%`} />
              <SummaryRow icon="📐" label="Withdrawal Rule"           value={`${result.withdrawalMultiplier}x (auto)`} />
            </div>

            <div className="bg-[#242424] border border-[#333] rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">Savings Breakdown</h2>
              <DonutChart netPct={result.netPct} inflPct={result.inflPct} taxPct={result.taxPct} />
            </div>

            <div className="bg-[#242424] border border-[#333] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={15} className="text-[#c7a481]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Analysis</h2>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                To achieve your desired after-tax income of{" "}
                <span className="text-white font-semibold">{fmt(desiredAfterTaxIncome)}/yr</span>, inflation-adjusted over{" "}
                <span className="text-white font-semibold">{timeFrame} years</span>, you will need a total savings of{" "}
                <span className="text-[#c7a481] font-bold">{fmt(result.totalNeeded)}</span>. This uses the{" "}
                <span className="text-white font-semibold">{result.withdrawalMultiplier}x rule</span> selected automatically based on your time frame.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                With your current savings of <span className="text-white font-semibold">{fmt(savings)}</span>, you still need an additional{" "}
                <span className="text-[#c7a481] font-bold">{fmt(result.additionalNeeded)}</span> to reach your goal.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tax at <span className="text-white font-semibold">{taxRate}%</span> will cost{" "}
                <span className="text-white font-semibold">{fmt(result.taxImpact)}</span>, and inflation at{" "}
                <span className="text-white font-semibold">{inflationRate}%</span> compounds to an estimated{" "}
                <span className="text-white font-semibold">{fmt(result.inflationImpact)}</span> in erosion over the period.
              </p>
              <button className="flex items-center gap-1.5 text-xs text-[#c7a481] mt-1 hover:underline">
                <span>●</span> Learn how we calculated your results
              </button>
            </div>
          </div>
        </div>
        <div className="h-12" />
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