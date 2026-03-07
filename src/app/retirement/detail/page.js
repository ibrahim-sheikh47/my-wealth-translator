/* eslint-disable react/no-unescaped-entities */
// app/retirement/detail/page.jsx

"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { ArrowLeft, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import GoodMorning from "@/app/components/GoodMorning";

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
  return `$${Math.round(n)}`;
};

// ─── Retirement calculation ───────────────────────────────────────────────────
function calcRetirement({
  currentAge,
  retirementAge,
  income,
  savings,
  contribution,
  budget,
  incomeIncrease,
  inflationRate,
  annualReturn,
  drawdownReturn,
  withdrawalMultiple,
}) {
  const ANNUAL_RETURN = annualReturn;
  const MONTHLY_RETURN = Math.pow(1 + ANNUAL_RETURN, 1 / 12) - 1;
  const DRAWDOWN_RETURN = drawdownReturn;
  const inflRate = inflationRate / 100;
  const incRate = incomeIncrease / 100;
  const yearsToRetire = retirementAge - currentAge;
  const HEALTHCARE_ESCALATION_AGE = 75;
  const HEALTHCARE_ESCALATION_RATE = 0.045;

  let projected = savings;
  let monthlyC = contribution;
  for (let y = 0; y < yearsToRetire; y++) {
    for (let m = 0; m < 12; m++) {
      projected = projected * (1 + MONTHLY_RETURN) + monthlyC;
    }
    if (y < yearsToRetire - 1) monthlyC = monthlyC * (1 + incRate);
  }

  const inflatedBudget = budget * Math.pow(1 + inflRate, yearsToRetire);

  let WITHDRAWAL_MULTIPLE = withdrawalMultiple;
  if (retirementAge <= 55) WITHDRAWAL_MULTIPLE = 30;
  else if (retirementAge <= 60) WITHDRAWAL_MULTIPLE = 28;
  else if (retirementAge <= 65) WITHDRAWAL_MULTIPLE = 25;
  else if (retirementAge <= 70) WITHDRAWAL_MULTIPLE = 23;
  else WITHDRAWAL_MULTIPLE = 22;

  const needed = inflatedBudget * WITHDRAWAL_MULTIPLE;

  let requiredMonthlyContrib = 0;
  if (yearsToRetire > 0) {
    const totalMonths = yearsToRetire * 12;
    const fvFactor = Math.pow(1 + MONTHLY_RETURN, totalMonths);
    const annuityFV = (fvFactor - 1) / MONTHLY_RETURN;
    requiredMonthlyContrib = Math.max(
      0,
      (needed - savings * fvFactor) / annuityFV,
    );
  }

  let remaining = projected;
  let ageRunOut = retirementAge;
  let currentBudget = inflatedBudget;
  while (remaining > 0 && ageRunOut < 120) {
    if (ageRunOut >= HEALTHCARE_ESCALATION_AGE) {
      currentBudget =
        inflatedBudget *
        Math.pow(
          1 + HEALTHCARE_ESCALATION_RATE,
          ageRunOut - HEALTHCARE_ESCALATION_AGE,
        );
    } else {
      currentBudget =
        inflatedBudget * Math.pow(1 + inflRate, ageRunOut - retirementAge);
    }
    remaining = remaining * (1 + DRAWDOWN_RETURN) - currentBudget;
    ageRunOut++;
  }

  return {
    projectedSavings: Math.round(projected),
    needed: Math.round(needed),
    currentContribution: Math.round(contribution),
    requiredContribution: Math.round(requiredMonthlyContrib),
    ageRunOut: Math.min(ageRunOut, 120),
    inflatedBudget: Math.round(inflatedBudget),
    withdrawalMultiple: WITHDRAWAL_MULTIPLE,
  };
}

// ─── Chart data ───────────────────────────────────────────────────────────────
function buildChartData({
  currentAge,
  retirementAge,
  savings,
  contribution,
  budget,
  incomeIncrease,
  inflationRate,
  annualReturn,
  drawdownReturn,
}) {
  const ANNUAL_RETURN = annualReturn;
  const MONTHLY_RETURN = Math.pow(1 + ANNUAL_RETURN, 1 / 12) - 1;
  const DRAWDOWN_RETURN = drawdownReturn;
  const inflRate = inflationRate / 100;
  const incRate = incomeIncrease / 100;
  const yearsToRetire = retirementAge - currentAge;
  const HEALTHCARE_ESCALATION_AGE = 75;
  const HEALTHCARE_ESCALATION_RATE = 0.045;
  const inflatedBudget = budget * Math.pow(1 + inflRate, yearsToRetire);

  let withdrawalMultiple = 25;
  if (retirementAge <= 55) withdrawalMultiple = 30;
  else if (retirementAge <= 60) withdrawalMultiple = 28;
  else if (retirementAge <= 65) withdrawalMultiple = 25;
  else if (retirementAge <= 70) withdrawalMultiple = 23;
  else withdrawalMultiple = 22;

  const needed = inflatedBudget * withdrawalMultiple;
  const ages = Array.from({ length: 71 }, (_, i) => 20 + i);

  const balanceAtAge = {};
  balanceAtAge[currentAge] = savings;
  let mc = contribution;
  for (let age = currentAge; age < retirementAge; age++) {
    let yearBal = balanceAtAge[age];
    for (let m = 0; m < 12; m++) yearBal = yearBal * (1 + MONTHLY_RETURN) + mc;
    balanceAtAge[age + 1] = yearBal;
    mc = mc * (1 + incRate);
  }

  for (let age = retirementAge; age < 90; age++) {
    const prev = balanceAtAge[age] ?? 0;
    let budgetAtAge =
      age >= HEALTHCARE_ESCALATION_AGE
        ? inflatedBudget *
          Math.pow(
            1 + HEALTHCARE_ESCALATION_RATE,
            age - HEALTHCARE_ESCALATION_AGE,
          )
        : inflatedBudget * Math.pow(1 + inflRate, age - retirementAge);
    balanceAtAge[age + 1] = Math.max(
      0,
      prev * (1 + DRAWDOWN_RETURN) - budgetAtAge,
    );
  }

  const projected = ages.map((age) => ({
    age,
    val: age < currentAge ? 0 : Math.round(balanceAtAge[age] ?? 0),
  }));

  const requiredAtAge = {};
  for (let age = currentAge; age <= retirementAge; age++) {
    const progress = yearsToRetire > 0 ? (age - currentAge) / yearsToRetire : 1;
    requiredAtAge[age] = needed * progress;
  }
  let reqBal = needed;
  for (let age = retirementAge; age < 90; age++) {
    let budgetAtAge =
      age >= HEALTHCARE_ESCALATION_AGE
        ? inflatedBudget *
          Math.pow(
            1 + HEALTHCARE_ESCALATION_RATE,
            age - HEALTHCARE_ESCALATION_AGE,
          )
        : inflatedBudget * Math.pow(1 + inflRate, age - retirementAge);
    reqBal = Math.max(0, reqBal * (1 + DRAWDOWN_RETURN) - budgetAtAge);
    requiredAtAge[age + 1] = reqBal;
  }

  const requiredPath = ages.map((age) => ({
    age,
    val: age < currentAge ? 0 : Math.round(requiredAtAge[age] ?? 0),
  }));
  const allVals = [...projected, ...requiredPath].map((p) => p.val);
  return { projected, required: requiredPath, maxVal: Math.max(...allVals, 1) };
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({
  currentAge,
  income,
  contribution,
  retirementAge,
  onEdit,
}) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#2a2a2a" }}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📅</span>
            <span>
              Current Age:{" "}
              <span className="text-white font-semibold">{currentAge}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">📈</span>
            <span>
              Pre-Tax Income:{" "}
              <span className="text-white font-semibold">{fmt(income)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">💰</span>
            <span>
              Monthly Contribution:{" "}
              <span className="text-white font-semibold">
                {fmt(contribution)}/mo
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-[#c7a481]">🎯</span>
            <span>
              Retirement Age:{" "}
              <span className="text-white font-semibold">{retirementAge}</span>
            </span>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Pencil size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Analysis accordion ───────────────────────────────────────────────────────
function AnalysisAccordion({
  retirementAge,
  projectedSavings,
  needed,
  currentContribution,
  requiredContribution,
  ageRunOut,
}) {
  const [open, setOpen] = useState(true);
  const onTrack = projectedSavings >= needed;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "#2a2a2a" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <span className="text-sm">💼</span>
          </div>
          <span className="text-white font-semibold text-sm">
            Retirement Savings at age {retirementAge}
          </span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: onTrack
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(239,68,68,0.15)",
                color: onTrack ? "#4ade80" : "#f87171",
              }}
            >
              {onTrack ? "✓ On Track" : "⚠ Gap Detected"}
            </span>
            {!onTrack && (
              <span className="text-xs text-gray-400">
                Increase contributions to close the gap
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 text-xs mb-3 border-t border-white/5 pt-4">
            <span />
            <span
              className="text-center font-semibold"
              style={{ color: "#c7a481" }}
            >
              You'll Have
            </span>
            <span className="text-center font-semibold text-gray-300">
              You'll Need
            </span>
          </div>

          {[
            {
              label: "Total Savings",
              have: fmt(projectedSavings),
              need: fmt(needed),
              warn: projectedSavings < needed,
            },
            {
              label: "Monthly Contribution",
              have: fmt(currentContribution) + "/mo",
              need: fmt(requiredContribution) + "/mo",
              warn: currentContribution < requiredContribution,
            },
            {
              label: "Age Savings Run Out",
              have: ageRunOut >= 120 ? "Never" : ageRunOut,
              need: "95+",
              warn: ageRunOut < 95,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-3 items-center py-2.5 border-b border-white/5 last:border-0"
            >
              <span className="text-xs text-gray-400 leading-tight pr-2">
                {row.label}
              </span>
              <span
                className="text-center text-sm font-semibold"
                style={{ color: row.warn ? "#f87171" : "#c7a481" }}
              >
                {row.have}
              </span>
              <span className="text-center text-sm font-semibold text-gray-200">
                {row.need}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SVG Chart ────────────────────────────────────────────────────────────────
function RetirementChart({ chartData, retirementAge, currentAge }) {
  const W = 340,
    H = 190,
    PL = 46,
    PR = 10,
    PT = 28,
    PB = 26;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const ages = chartData.projected.map((p) => p.age);
  const minAge = ages[0];
  const maxAge = ages[ages.length - 1];
  const maxVal = chartData.maxVal || 1_000_000;
  const xS = (age) => ((age - minAge) / (maxAge - minAge)) * innerW;
  const yS = (val) => innerH - (val / maxVal) * innerH;
  const toPath = (pts) =>
    pts
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${xS(p.age).toFixed(1)},${yS(p.val).toFixed(1)}`,
      )
      .join(" ");
  const peak = chartData.projected.reduce((a, b) => (b.val > a.val ? b : a));
  const yTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round((maxVal / 4) * i),
  );
  const retX = xS(retirementAge);
  const curX = xS(currentAge);

  return (
    <div
      className="rounded-2xl mt-4 overflow-hidden"
      style={{ backgroundColor: "#2a2a2a", padding: "16px 12px 12px" }}
    >
      <div className="flex items-center gap-4 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-0.5 rounded"
            style={{ backgroundColor: "#c7a481" }}
          />
          <span className="text-[10px] text-gray-400">Your Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-0.5 rounded"
            style={{
              backgroundColor: "#8b1c1c",
              borderTop: "1px dashed #8b1c1c",
            }}
          />
          <span className="text-[10px] text-gray-400">Required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-px h-3" style={{ backgroundColor: "#555" }} />
          <span className="text-[10px] text-gray-400">Retirement</span>
        </div>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c7a481" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c7a481" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${PL},${PT})`}>
          {yTicks.map((t) => (
            <line
              key={t}
              x1={0}
              y1={yS(t)}
              x2={innerW}
              y2={yS(t)}
              stroke="#333"
              strokeWidth={0.5}
            />
          ))}
          <line
            x1={retX}
            y1={0}
            x2={retX}
            y2={innerH}
            stroke="#555"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          <text x={retX + 3} y={8} fill="#666" fontSize={6.5} fontWeight="500">
            Age {retirementAge}
          </text>
          <path
            d={`${toPath(chartData.projected)} L${xS(maxAge)},${innerH} L${xS(minAge)},${innerH} Z`}
            fill="url(#goldGrad)"
          />
          <path
            d={toPath(chartData.required)}
            fill="none"
            stroke="#8b1c1c"
            strokeWidth={1.8}
            strokeDasharray="5,3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={toPath(chartData.projected)}
            fill="none"
            stroke="#c7a481"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle
            cx={xS(peak.age)}
            cy={yS(peak.val)}
            r={3.5}
            fill="#c7a481"
            stroke="#1a1a1a"
            strokeWidth={1.5}
          />
          <rect
            x={xS(peak.age) - 30}
            y={yS(peak.val) - 22}
            width={60}
            height={16}
            rx={4}
            fill="#2a2a2a"
            stroke="#c7a481"
            strokeWidth={0.8}
          />
          <text
            x={xS(peak.age)}
            y={yS(peak.val) - 10}
            textAnchor="middle"
            fill="#c7a481"
            fontSize={7}
            fontWeight="bold"
          >
            {fmtK(peak.val)}
          </text>
          <circle
            cx={curX}
            cy={yS(
              chartData.projected.find((p) => p.age === currentAge)?.val ?? 0,
            )}
            r={2.5}
            fill="#fff"
            stroke="#1a1a1a"
            strokeWidth={1}
          />
          {yTicks.map((t) => (
            <text
              key={t}
              x={-5}
              y={yS(t) + 3}
              textAnchor="end"
              fill="#555"
              fontSize={6.5}
            >
              {t === 0
                ? "$0"
                : t >= 1_000_000
                  ? `$${(t / 1_000_000).toFixed(1)}m`
                  : `$${Math.round(t / 1000)}k`}
            </text>
          ))}
          {[20, 30, 40, 50, 60, 70, 80, 90].map((age) => (
            <text
              key={age}
              x={xS(age)}
              y={innerH + 14}
              textAnchor="middle"
              fill="#555"
              fontSize={6.5}
            >
              {age}
            </text>
          ))}
          <line
            x1={0}
            y1={innerH}
            x2={innerW}
            y2={innerH}
            stroke="#333"
            strokeWidth={0.5}
          />
        </g>
      </svg>
    </div>
  );
}

// ─── Performance table ────────────────────────────────────────────────────────
// ─── Performance table ────────────────────────────────────────────────────────
function PerformanceTable({ accounts, contribution, config }) {
  const annualContrib = contribution * 12;
  const is401kCapped = annualContrib > config.max401k;
  const isRothCapped = annualContrib > config.maxRoth;
  const showBanner = is401kCapped || isRothCapped;

  return (
    <div className="mt-6">
      <p className="text-sm font-bold text-white mb-3">
        Account Type Comparison
      </p>

      {showBanner && (
        <div
          className="mb-3 rounded-xl px-4 py-3 text-xs space-y-1"
          style={{ backgroundColor: "rgba(199,164,129,0.08)", border: "1px solid rgba(199,164,129,0.2)" }}
        >
          <p className="font-semibold" style={{ color: "#c7a481" }}>
            ⚠ IRS 2025 Contribution Limits Applied
          </p>
          {is401kCapped && (
            <p className="text-gray-400">
              • Traditional 401k capped at{" "}
              <span className="text-white font-medium">
                ${config.max401k.toLocaleString()}/yr
              </span>{" "}
              (IRS 2025 limit)
            </p>
          )}
          {isRothCapped && (
            <p className="text-gray-400">
              • Roth IRA capped at{" "}
              <span className="text-white font-medium">
                ${config.maxRoth.toLocaleString()}/yr
              </span>{" "}
              (IRS 2025 limit)
            </p>
          )}
        </div>
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#2a2a2a" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Account Type",
                  "Tax Benefits",
                  "Est. Value at Retirement",
                  "Growth",
                  "Liquidity",
                  "Fees",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-semibold"
                    style={{ color: "#c7a481" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((row) => (
                <tr
                  key={row.type}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{row.taxBenefits}</td>
                  <td
                    className="px-4 py-3 font-semibold"
                    style={{ color: "#c7a481" }}
                  >
                    {row.projectedValue}
                  </td>
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

  // Get logged-in user from Redux
  const user = useSelector((state) => state.auth.user);

  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(false);

  // "idle" | "saving" | "saved" | "error"
  const [saveStatus, setSaveStatus] = useState("idle");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const docRef = doc(db, "retirement_config", "constants");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig({
            annualReturn: data.accumulation_return,
            drawdownReturn: data.drawdown_return,
            withdrawalMultiple: data.withdrawal_rule_multiple,
            fiaReturn: data.fia_return,
            iulReturn: data.iul_return,
            max401k: data.max_401k_contribution,
            maxRoth: data.max_roth_ira_contribution,
          });
        } else {
          setConfigError(true);
        }
      } catch (error) {
        console.error("[RetirementDetail] Firestore config error:", error);
        setConfigError(true);
      } finally {
        setConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const currentAge = Number(params.get("currentAge") || 35);
  const income = Number(params.get("income") || 60000);
  const savings = Number(params.get("savings") || 150000);
  const contribution = Number(params.get("contribution") || 500);
  const budget = Number(params.get("budget") || 60000);
  const retirementAge = Number(params.get("retirementAge") || 67);
  const incomeIncrease = Number(params.get("incomeIncrease") || 3);
  const inflationRate = Number(params.get("inflationRate") || 2.5);

  const result = useMemo(() => {
    if (!config) return null;
    return calcRetirement({
      currentAge,
      retirementAge,
      income,
      savings,
      contribution,
      budget,
      incomeIncrease,
      inflationRate,
      annualReturn: config.annualReturn,
      drawdownReturn: config.drawdownReturn,
      withdrawalMultiple: config.withdrawalMultiple,
    });
  }, [
    currentAge,
    retirementAge,
    income,
    savings,
    contribution,
    budget,
    incomeIncrease,
    inflationRate,
    config,
  ]);

  const chartData = useMemo(() => {
    if (!config) return null;
    return buildChartData({
      currentAge,
      retirementAge,
      savings,
      contribution,
      budget,
      incomeIncrease,
      inflationRate,
      annualReturn: config.annualReturn,
      drawdownReturn: config.drawdownReturn,
    });
  }, [
    currentAge,
    retirementAge,
    savings,
    contribution,
    budget,
    incomeIncrease,
    inflationRate,
    config,
  ]);

  const accounts = useMemo(() => {
    if (!config) return null;
    const yearsToRetire = retirementAge - currentAge;

    // IRS 2025 annual contribution limits
    const MAX_401K_ANNUAL = config.max401k;
    const MAX_ROTH_ANNUAL = config.maxRoth;

    const calc = (rate, annualLimit = null) => {
      const annualContrib = annualLimit
        ? Math.min(contribution * 12, annualLimit)
        : contribution * 12;
      let bal = savings;
      for (let y = 0; y < yearsToRetire; y++)
        bal = bal * (1 + rate) + annualContrib;
      return Math.round(bal);
    };

    return [
      {
        type: "Traditional 401k",
        taxBenefits: "Pre-tax / Deferred",
        growth: `~${(config.annualReturn * 100).toFixed(1)}% avg`,
        projectedValue: fmt(calc(config.annualReturn, MAX_401K_ANNUAL)), // ← capped
        liquidity: "Moderate",
        fees: "Low",
      },
      {
        type: "Roth IRA",
        taxBenefits: "After-tax / Tax-free",
        growth: `~${(config.annualReturn * 100).toFixed(1)}% avg`,
        projectedValue: fmt(calc(config.annualReturn, MAX_ROTH_ANNUAL)), // ← capped
        liquidity: "Moderate",
        fees: "Low",
      },
      {
        type: "FIA",
        taxBenefits: "Tax-advantaged",
        growth: `~${(config.fiaReturn * 100).toFixed(1)}% avg`,
        projectedValue: fmt(calc(config.fiaReturn)), // no cap
        liquidity: "Low",
        fees: "Moderate",
      },
      {
        type: "IUL",
        taxBenefits: "Tax-advantaged",
        growth: `~${(config.iulReturn * 100).toFixed(1)}% avg`,
        projectedValue: fmt(calc(config.iulReturn)), // no cap
        liquidity: "Moderate",
        fees: "High",
      },
    ];
  }, [config, savings, contribution, retirementAge, currentAge]);

  const editUrl = `/retirement?currentAge=${currentAge}&income=${income}&savings=${savings}&contribution=${contribution}&budget=${budget}&retirementAge=${retirementAge}&incomeIncrease=${incomeIncrease}&inflationRate=${inflationRate}`;

  // ── Save to Firestore ───────────────────────────────────────────────────────
  // Stored under: users/{uid}/retirement_reports/{auto-id}
  const handleSave = async () => {
    if (!user?.uid) {
      alert("Please log in to save reports.");
      return;
    }
    setSaveStatus("saving");
    try {
      await addDoc(collection(db, "users", user.uid, "retirement_reports"), {
        // All input values — used to pre-fill the form on revisit
        currentAge,
        income,
        savings,
        contribution,
        budget,
        retirementAge,
        incomeIncrease,
        inflationRate,
        // Computed summary — useful for display in a future reports list
        projectedSavings: result.projectedSavings,
        needed: result.needed,
        ageRunOut: result.ageRunOut,
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

  const handleExport = () => {
    if (!result) return;
    const lines = [
      "Retirement Analysis",
      `Current Age,${currentAge}`,
      `Retirement Age,${retirementAge}`,
      `Annual Income,${income}`,
      `Monthly Contribution,${contribution}`,
      `Required Monthly Contribution,${result.requiredContribution}`,
      `Current Savings,${savings}`,
      `Projected Savings at Retirement,${result.projectedSavings}`,
      `Amount Needed at Retirement,${result.needed}`,
      `Inflation-Adjusted Annual Budget,${result.inflatedBudget}`,
      `Age Savings Run Out,${result.ageRunOut >= 120 ? "Never" : result.ageRunOut}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "retirement-analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "✓ Saved!"
        : saveStatus === "error"
          ? "Error — Try Again"
          : "Save";

  // ── Early returns AFTER all hooks ─────────────────────────────────────────
  if (configLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c7a481]" />
      </div>
    );
  }

  if (configError || !config || !result || !chartData || !accounts) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-gray-400">
        Unable to load configuration. Please try again.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div className="px-5 py-8 lg:px-8 lg:py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <GoodMorning />
        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-6">
          Your <span className="text-[#c7a481]">retirement</span>
          <br />
          options results
        </h1>

        <p className="text-xs text-gray-500 mb-4">
          Assumes {(config.annualReturn * 100).toFixed(0)}% annual return during
          accumulation, {(config.drawdownReturn * 100).toFixed(0)}% during
          drawdown, and the {(100 / config.withdrawalMultiple).toFixed(0)}% safe
          withdrawal rule ({config.withdrawalMultiple}× annual spend).
        </p>

        <SummaryCard
          currentAge={currentAge}
          income={income}
          contribution={contribution}
          retirementAge={retirementAge}
          onEdit={() => router.push(editUrl)}
        />

        <button
          className="mt-4 flex items-center gap-1.5 text-xs"
          style={{ color: "#c7a481" }}
        >
          <span>●</span> Learn how we calculated your results
        </button>

        <p className="mt-6 mb-3 text-sm font-bold text-white">Analysis</p>

        <AnalysisAccordion
          retirementAge={retirementAge}
          projectedSavings={result.projectedSavings}
          needed={result.needed}
          currentContribution={result.currentContribution}
          requiredContribution={result.requiredContribution}
          ageRunOut={result.ageRunOut}
        />

        <RetirementChart
          chartData={chartData}
          retirementAge={retirementAge}
          currentAge={currentAge}
        />

        <PerformanceTable accounts={accounts} contribution={contribution} config={config} />

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: "#8b1c1c" }}
          >
            {saveLabel}
          </button>
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
          <button
            onClick={() => router.push("/retirement")}
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

export default function RetirementDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a]" />}>
      <RetirementDetailInner />
    </Suspense>
  );
}
