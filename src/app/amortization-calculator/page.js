"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import {
  DollarSign,
  Percent,
  Calendar,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FormInput from "@/app/components/FormInput";
import GoodMorning from "../components/GoodMorning";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-zinc-500 text-xs uppercase tracking-widest">
        {label}
      </span>
      <span className="text-2xl font-bold text-white">{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

function DonutChart({ principal, interest }) {
  const total = principal + interest;
  const pPct = total > 0 ? (principal / total) * 100 : 0;
  const iPct = 100 - pPct;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pDash = (pPct / 100) * circ;
  const iDash = (iPct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#1e1e1e"
            strokeWidth="14"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#c7a481"
            strokeWidth="14"
            strokeDasharray={`${pDash} ${circ}`}
            strokeLinecap="butt"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#3a3a3a"
            strokeWidth="14"
            strokeDasharray={`${iDash} ${circ}`}
            strokeDashoffset={-pDash}
            strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Principal
          </span>
          <span className="text-lg font-bold text-[#c7a481]">
            {pPct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="flex gap-5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#c7a481] inline-block" />
          <span className="text-zinc-400">Principal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3a3a3a] inline-block border border-zinc-600" />
          <span className="text-zinc-400">Interest</span>
        </div>
      </div>
    </div>
  );
}

function BarChart({ schedule, view }) {
  const data =
    view === "annual" ? schedule.annual : schedule.monthly.slice(0, 24);
  const maxVal = Math.max(...data.map((d) => d.balance));
  const minVal = Math.min(...data.map((d) => d.balance));
  const range = maxVal - minVal || 1;
  const BAR_H = 140;
  const LABEL_H = 20;
  const labelEvery = data.length <= 15 ? 1 : Math.ceil(data.length / 12);

  return (
    <div className="w-full">
      <div
        className="flex items-end gap-[3px]"
        style={{ height: BAR_H + LABEL_H }}
      >
        {data.map((d, i) => {
          const barH =
            ((d.balance - minVal) / range) * (BAR_H * 0.85) + BAR_H * 0.12;
          const showLabel = i % labelEvery === 0 || i === data.length - 1;
          const labelVal = "$" + (d.balance / 1000).toFixed(0) + "k";
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group relative"
              style={{ height: BAR_H + LABEL_H }}
            >
              <div
                style={{ height: LABEL_H }}
                className="w-full flex items-center justify-center"
              >
                {showLabel && (
                  <span className="text-[8px] text-[#c7a481] font-medium whitespace-nowrap">
                    {labelVal}
                  </span>
                )}
              </div>
              <div className="w-full flex items-end" style={{ height: BAR_H }}>
                <div
                  className="w-full bg-gradient-to-t from-[#c7a481] to-[#8b6a44] rounded-sm transition-all duration-300 group-hover:brightness-125"
                  style={{ height: barH }}
                />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#1a1a1a] border border-[#c7a481]/40 rounded px-2 py-1.5 text-[10px] text-white whitespace-nowrap z-20 gap-0.5 shadow-lg">
                <span className="text-[#c7a481] font-semibold">
                  {view === "annual" ? `Year ${d.period}` : `Month ${d.period}`}
                </span>
                <span>
                  $
                  {d.balance.toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-zinc-600">
        <span>{view === "annual" ? "Year 1" : "Month 1"}</span>
        <span className="text-zinc-500 text-[10px]">Remaining Balance</span>
        <span>
          {view === "annual" ? `Year ${data.length}` : `Month ${data.length}`}
        </span>
      </div>
    </div>
  );
}

// ─── Comparison Chart ────────────────────────────────────────────────────────

function ComparisonChart({
  loanAmount,
  interestRate,
  loanTerm,
  extraPayment,
  baseMonthly,
}) {
  const r = interestRate / 100 / 12;
  const totalMonths = loanTerm * 12;

  // Without extra payment
  const withoutData = [];
  let bal = loanAmount;
  for (let m = 1; m <= totalMonths; m++) {
    const intP = bal * r;
    const prinP = Math.min(baseMonthly - intP, bal);
    bal = Math.max(0, bal - prinP);
    if (m % 12 === 0 || bal <= 0) {
      withoutData.push({ year: Math.ceil(m / 12), balance: bal });
      if (bal <= 0) break;
    }
  }

  // With extra payment
  const withData = [];
  bal = loanAmount;
  const monthlyWithExtra = baseMonthly + extraPayment;
  for (let m = 1; m <= totalMonths; m++) {
    const intP = bal * r;
    const prinP = Math.min(monthlyWithExtra - intP, bal);
    bal = Math.max(0, bal - prinP);
    if (m % 12 === 0 || bal <= 0) {
      withData.push({ year: Math.ceil(m / 12), balance: bal });
      if (bal <= 0) break;
    }
  }

  const maxYears = withoutData.length;
  const maxBalance = loanAmount;
  const BAR_H = 160;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1" style={{ height: BAR_H + 24 }}>
        {withoutData.map((d, i) => {
          const withVal = withData[i]?.balance ?? 0;
          const withoutH = Math.max((d.balance / maxBalance) * BAR_H, 2);
          const withH =
            withVal <= 0 ? 0 : Math.max((withVal / maxBalance) * BAR_H, 2);
          const showLabel =
            i === 0 ||
            i === withoutData.length - 1 ||
            i % Math.ceil(maxYears / 6) === 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group relative"
              style={{ height: BAR_H + 24 }}
            >
              <div
                className="w-full flex items-end gap-px"
                style={{ height: BAR_H }}
              >
                <div
                  className="flex-1 rounded-t-sm transition-all duration-300"
                  style={{
                    height: withoutH,
                    backgroundColor: "#3a3a3a",
                    border: "1px solid #555",
                  }}
                />
                {withH > 0 && (
                  <div
                    className="flex-1 rounded-t-sm transition-all duration-300"
                    style={{ height: withH, backgroundColor: "#c7a481" }}
                  />
                )}
              </div>
              {showLabel && (
                <span className="text-[8px] text-zinc-600 mt-1">Y{d.year}</span>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#1a1a1a] border border-[#c7a481]/40 rounded px-2 py-1.5 text-[10px] text-white whitespace-nowrap z-20 gap-0.5 shadow-lg">
                <span className="text-[#c7a481] font-semibold">
                  Year {d.year}
                </span>
                <span className="text-zinc-400">
                  Without: ${Math.round(d.balance).toLocaleString()}
                </span>
                <span className="text-[#c7a481]">
                  With: ${Math.round(withVal).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-5 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm inline-block border border-zinc-600"
            style={{ backgroundColor: "#3a3a3a" }}
          />
          <span className="text-zinc-400">Without extra payment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#c7a481] inline-block" />
          <span className="text-zinc-400">With extra payment</span>
        </div>
      </div>
    </div>
  );
}

// ─── Comparison Row ──────────────────────────────────────────────────────────

function CompareRow({ label, without, withVal, savingLabel, better }) {
  return (
    <div className="grid grid-cols-4 items-center py-3.5 border-b border-[#1e1e1e] last:border-0">
      <span className="text-xs text-zinc-500 pr-2">{label}</span>
      <span className="text-sm font-semibold text-center text-zinc-400">
        {without}
      </span>
      <span className="text-sm font-semibold text-center text-[#c7a481]">
        {withVal}
      </span>
      <span
        className="text-xs font-semibold text-center"
        style={{ color: better ? "#4ade80" : "#f87171" }}
      >
        {savingLabel}
      </span>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const termOptions = [
  { value: "10", label: "10 years" },
  { value: "15", label: "15 years" },
  { value: "20", label: "20 years" },
  { value: "25", label: "25 years" },
  { value: "30", label: "30 years" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AmortizationCalculator() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loanAmount: "",
      interestRate: "",
      loanTerm: "",
      extraPayment: "",
    },
  });

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    (async () => {
      try {
        const q = query(
          collection(db, "users", uid, "amortization_reports"),
          orderBy("savedAt", "desc"),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const r = snap.docs[0].data();
          reset({
            loanAmount: String(r.loanAmount ?? ""),
            interestRate: String(r.interestRate ?? ""),
            loanTerm: String(r.loanTerm ?? ""),
            extraPayment: r.extraPayment ? String(r.extraPayment) : "",
          });
        }
      } catch (err) {
        console.error("[AmortizationCalculator] prefill error:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loanAmount = watch("loanAmount");
  const interestRate = watch("interestRate");
  const loanTerm = watch("loanTerm");
  const extraPayment = watch("extraPayment");

  const [scheduleView, setScheduleView] = useState("annual");
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  // ── Amortization calculation ───────────────────────────────────────────────
  const results = useMemo(() => {
    const P = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseInt(loanTerm) || 0;
    const extra = parseFloat(extraPayment) || 0;

    if (!P || !rate || !years) return null;

    const r = rate / 100 / 12;
    const n = years * 12;
    const baseMonthly =
      r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
    const monthly = baseMonthly + extra;

    // WITH extra payment schedule
    let balance = P,
      totalInterest = 0,
      annualInterest = 0,
      annualPrincipal = 0,
      month = 0;
    const monthlySchedule = [],
      annualSchedule = [];

    while (balance > 0.01 && month < 600) {
      month++;
      const intPayment = balance * r;
      const prinPayment = Math.min(monthly - intPayment, balance);
      balance = Math.max(0, balance - prinPayment);
      totalInterest += intPayment;
      annualInterest += intPayment;
      annualPrincipal += prinPayment;
      monthlySchedule.push({
        period: month,
        interest: intPayment,
        principal: prinPayment,
        balance,
      });
      if (month % 12 === 0 || balance <= 0.01) {
        annualSchedule.push({
          period: Math.ceil(month / 12),
          interest: annualInterest,
          principal: annualPrincipal,
          balance,
        });
        annualInterest = 0;
        annualPrincipal = 0;
      }
    }

    // WITHOUT extra payment calculation
    const originalInterest = baseMonthly * n - P;
    const originalTotalPayment = P + originalInterest;
    const originalTerm = years;
    const originalTermMonths = n;

    const actualTermMonths = month;
    const actualTermYears = Math.floor(actualTermMonths / 12);
    const actualTermRemMonths = actualTermMonths % 12;

    const monthsSaved = extra > 0 ? n - month : 0;
    const interestSaved = extra > 0 ? originalInterest - totalInterest : 0;
    const actualTotalPayment = P + totalInterest;

    return {
      monthly: baseMonthly,
      monthlyWithExtra: monthly,
      totalPayment: actualTotalPayment,
      totalInterest,
      monthsSaved,
      interestSaved,
      actualTermMonths,
      actualTermYears,
      actualTermRemMonths,
      originalInterest,
      originalTotalPayment,
      originalTermMonths,
      schedule: { monthly: monthlySchedule, annual: annualSchedule },
    };
  }, [loanAmount, interestRate, loanTerm, extraPayment]);

  const hasExtra = parseFloat(extraPayment) > 0 && results?.monthsSaved > 0;

  const displaySchedule = results
    ? scheduleView === "annual"
      ? results.schedule.annual
      : results.schedule.monthly
    : [];
  const visibleRows = showFullSchedule
    ? displaySchedule
    : displaySchedule.slice(0, 5);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!results) return;
    if (!user?.uid) {
      alert("Please log in to save reports.");
      return;
    }
    setSaveStatus("saving");
    try {
      await addDoc(collection(db, "users", user.uid, "amortization_reports"), {
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        loanTerm: loanTerm,
        extraPayment: parseFloat(extraPayment) || 0,
        monthlyPayment: results.monthly,
        totalPayment: results.totalPayment,
        totalInterest: results.totalInterest,
        monthsSaved: results.monthsSaved,
        interestSaved: results.interestSaved,
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

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!results) return;
    const lines = [
      "Amortization Analysis",
      `Loan Amount,${loanAmount}`,
      `Annual Interest Rate (%),${interestRate}`,
      `Loan Term (years),${loanTerm}`,
      `Extra Monthly Payment,${extraPayment || 0}`,
      `Monthly Payment,${results.monthly.toFixed(2)}`,
      `Total Payment,${results.totalPayment.toFixed(2)}`,
      `Total Interest,${results.totalInterest.toFixed(2)}`,
      "",
      scheduleView === "annual"
        ? "Year,Interest,Principal,Balance"
        : "Month,Interest,Principal,Balance",
      ...displaySchedule.map(
        (r) =>
          `${r.period},${r.interest.toFixed(2)},${r.principal.toFixed(2)},${r.balance.toFixed(2)}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amortization.csv";
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div className="px-6 pt-8 pb-12 lg:px-12 lg:pt-12">
        <GoodMorning />

        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            My <span className="text-[#c7a481]">Amortization</span> Calculator
          </h1>
          <p className="text-zinc-400 mt-2 text-base">
            Break down your loan payments, interest costs, and payoff timeline.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Left: Inputs ── */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Loan Details</h2>
            <FormInput
              name="loanAmount"
              register={register}
              error={errors.loanAmount}
              title="Loan Amount"
              type="number"
              placeholder="e.g. 300000"
              icon={<DollarSign size={18} />}
            />
            <FormInput
              name="interestRate"
              register={register}
              error={errors.interestRate}
              title="Annual Interest Rate (%)"
              type="number"
              placeholder="e.g. 6.5"
              icon={<Percent size={18} />}
            />
            <FormInput
              name="loanTerm"
              register={register}
              error={errors.loanTerm}
              title="Loan Term"
              select
              options={termOptions}
              icon={<Calendar size={18} />}
            />
            <div className="pt-1">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                Optional
              </p>
              <FormInput
                name="extraPayment"
                register={register}
                error={errors.extraPayment}
                title="Extra Monthly Payment"
                type="number"
                placeholder="e.g. 200"
                icon={<DollarSign size={18} />}
              />
            </div>

            {hasExtra && (
              <div className="bg-[#111] border border-[#c7a481]/20 rounded-xl p-4">
                <p className="text-[#c7a481] text-sm font-semibold mb-1">
                  💡 Extra Payment Impact
                </p>
                <p className="text-zinc-400 text-sm">
                  You&apos;ll pay off{" "}
                  <span className="text-white font-medium">
                    {Math.floor(results.monthsSaved / 12)}y{" "}
                    {results.monthsSaved % 12}mo
                  </span>{" "}
                  early
                </p>
                <p className="text-zinc-400 text-sm mt-2">
                  With the extra payment(s), the loan will be paid off in{" "}
                  <span className="text-white font-medium">
                    {Math.floor(
                      (parseInt(loanTerm) * 12 - results.monthsSaved) / 12,
                    )}
                    y {(parseInt(loanTerm) * 12 - results.monthsSaved) % 12}mo
                  </span>
                  , and{" "}
                  <span className="text-white font-medium">
                    {fmt(results.interestSaved)}
                  </span>{" "}
                  interest will be saved.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Summary ── */}
          <div className="flex flex-col gap-4">
            {results ? (
              <>
                <div className="bg-[#c7a481] rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[#6b4c2a] text-xs uppercase tracking-widest font-semibold mb-1">
                      Monthly Payment
                    </p>
                    <p className="text-4xl font-bold text-[#1a1a1a]">
                      {fmt(results.monthly + (parseFloat(extraPayment) || 0))}
                    </p>
                    {parseFloat(extraPayment) > 0 && (
                      <p className="text-[#6b4c2a] text-xs mt-1">
                        Base {fmt(results.monthly)} +{" "}
                        {fmt(parseFloat(extraPayment))} extra
                      </p>
                    )}
                  </div>
                  <TrendingDown
                    size={40}
                    className="text-[#6b4c2a] opacity-40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Total Payment"
                    value={fmt(results.totalPayment)}
                  />
                  <StatCard
                    label="Total Interest"
                    value={fmt(results.totalInterest)}
                  />
                  <StatCard
                    label="Loan Amount"
                    value={fmt(parseFloat(loanAmount) || 0)}
                  />
                  <StatCard
                    label="Loan Term"
                    value={`${loanTerm} years`}
                    sub={`${parseInt(loanTerm) * 12} payments`}
                  />
                </div>

                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-5 flex flex-col items-center">
                  <DonutChart
                    principal={parseFloat(loanAmount) || 0}
                    interest={results.totalInterest}
                  />
                </div>
              </>
            ) : (
              <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-10 flex items-center justify-center h-full">
                <p className="text-zinc-500 text-sm text-center">
                  Enter your loan details
                  <br />
                  to see the breakdown.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Balance Chart ── */}
        {results && (
          <div className="mt-6 bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">
                Balance Over Time
              </h2>
              <div className="flex bg-[#111] rounded-lg border border-[#3a3a3a] overflow-hidden text-xs">
                {["annual", "monthly"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setScheduleView(v)}
                    className={`px-3 py-1.5 capitalize transition ${scheduleView === v ? "bg-[#c7a481] text-[#1a1a1a] font-semibold" : "text-zinc-400 hover:text-white"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <BarChart schedule={results.schedule} view={scheduleView} />
          </div>
        )}

        {/* ── WITH vs WITHOUT COMPARISON ── */}
        {results && hasExtra && (
          <div className="mt-6 bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl overflow-hidden">
            {/* Header */}
            <div
              className="px-6 py-4 border-b border-[#3a3a3a]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(199,164,129,0.08) 0%, transparent 100%)",
              }}
            >
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-[#c7a481]">⚡</span> Extra Payment
                Comparison
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                See the full impact of adding {fmt(parseFloat(extraPayment))}/mo
                extra
              </p>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-4 px-6 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
              <span className="text-xs text-zinc-600 uppercase tracking-widest">
                Metric
              </span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest text-center">
                Without Extra
              </span>
              <span className="text-xs text-[#c7a481] uppercase tracking-widest text-center">
                With Extra
              </span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest text-center">
                Difference
              </span>
            </div>

            {/* Comparison Rows */}
            <div className="px-6">
              <CompareRow
                label="Monthly Payment"
                without={fmt(results.monthly)}
                withVal={fmt(results.monthlyWithExtra)}
                savingLabel={`+${fmt(parseFloat(extraPayment))}/mo`}
                better={false}
              />
              <CompareRow
                label="Total Interest Paid"
                without={fmt(results.originalInterest)}
                withVal={fmt(results.totalInterest)}
                savingLabel={`Save ${fmt(results.interestSaved)}`}
                better={true}
              />
              <CompareRow
                label="Total Amount Paid"
                without={fmt(results.originalTotalPayment)}
                withVal={fmt(results.totalPayment)}
                savingLabel={`Save ${fmt(results.originalTotalPayment - results.totalPayment)}`}
                better={true}
              />
              <CompareRow
                label="Loan Term"
                without={`${parseInt(loanTerm)}y 0mo`}
                withVal={`${results.actualTermYears}y ${results.actualTermRemMonths}mo`}
                savingLabel={`${Math.floor(results.monthsSaved / 12)}y ${results.monthsSaved % 12}mo faster`}
                better={true}
              />
              <CompareRow
                label="Total Payments Count"
                without={`${results.originalTermMonths} payments`}
                withVal={`${results.actualTermMonths} payments`}
                savingLabel={`${results.monthsSaved} fewer`}
                better={true}
              />
              <CompareRow
                label="Interest to Principal Ratio"
                without={`${((results.originalInterest / parseFloat(loanAmount)) * 100).toFixed(1)}%`}
                withVal={`${((results.totalInterest / parseFloat(loanAmount)) * 100).toFixed(1)}%`}
                savingLabel={`${(((results.originalInterest - results.totalInterest) / parseFloat(loanAmount)) * 100).toFixed(1)}% less`}
                better={true}
              />
            </div>

            {/* Savings Highlight Banner */}
            <div
              className="mx-6 my-4 rounded-xl p-4 flex items-center justify-between"
              style={{
                backgroundColor: "rgba(199,164,129,0.08)",
                border: "1px solid rgba(199,164,129,0.2)",
              }}
            >
              <div>
                <p className="text-xs text-zinc-500 mb-1">
                  Total Savings with Extra Payment
                </p>
                <p className="text-2xl font-bold text-[#c7a481]">
                  {fmt(results.interestSaved)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-1">Time Saved</p>
                <p className="text-2xl font-bold text-white">
                  {Math.floor(results.monthsSaved / 12)}y{" "}
                  {results.monthsSaved % 12}mo
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-1">Extra Invested</p>
                <p className="text-2xl font-bold text-white">
                  {fmt(parseFloat(extraPayment) * results.actualTermMonths)}
                </p>
              </div>
            </div>

            {/* Side by Side Balance Chart */}
            <div className="px-6 pb-6">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
                Balance Over Time — With vs Without
              </p>
              <ComparisonChart
                loanAmount={parseFloat(loanAmount)}
                interestRate={parseFloat(interestRate)}
                loanTerm={parseInt(loanTerm)}
                extraPayment={parseFloat(extraPayment)}
                baseMonthly={results.monthly}
              />
            </div>

            {/* Donut Comparison */}
            <div className="grid grid-cols-2 gap-px bg-[#3a3a3a] border-t border-[#3a3a3a]">
              <div className="bg-[#2a2a2a] p-6 flex flex-col items-center">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
                  Without Extra
                </p>
                <DonutChart
                  principal={parseFloat(loanAmount)}
                  interest={results.originalInterest}
                />
                <p className="text-xs text-zinc-500 mt-3 text-center">
                  Interest:{" "}
                  <span className="text-white">
                    {fmt(results.originalInterest)}
                  </span>
                </p>
              </div>
              <div className="bg-[#222] p-6 flex flex-col items-center">
                <p className="text-xs text-[#c7a481] uppercase tracking-widest mb-4">
                  With Extra ✓
                </p>
                <DonutChart
                  principal={parseFloat(loanAmount)}
                  interest={results.totalInterest}
                />
                <p className="text-xs text-zinc-500 mt-3 text-center">
                  Interest:{" "}
                  <span className="text-[#c7a481]">
                    {fmt(results.totalInterest)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Amortization Schedule Table ── */}
        {results && (
          <div className="mt-6 bg-[#2a2a2a] border border-[#3a3a3a] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
              <h2 className="text-base font-semibold text-white">
                Amortization Schedule
              </h2>
              <div className="flex bg-[#111] rounded-lg border border-[#3a3a3a] overflow-hidden text-xs">
                {["annual", "monthly"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setScheduleView(v);
                      setShowFullSchedule(false);
                    }}
                    className={`px-3 py-1.5 capitalize transition ${scheduleView === v ? "bg-[#c7a481] text-[#1a1a1a] font-semibold" : "text-zinc-400 hover:text-white"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#3a3a3a]">
                    <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
                      {scheduleView === "annual" ? "Year" : "Month"}
                    </th>
                    <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
                      Interest
                    </th>
                    <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
                      Principal
                    </th>
                    <th className="text-right px-6 py-3 text-xs uppercase tracking-widest text-zinc-500 font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#1e1e1e] hover:bg-[#222] transition"
                    >
                      <td className="px-6 py-3 text-[#c7a481] font-medium">
                        {row.period}
                      </td>
                      <td className="px-6 py-3 text-right text-zinc-300">
                        {fmt(row.interest)}
                      </td>
                      <td className="px-6 py-3 text-right text-zinc-300">
                        {fmt(row.principal)}
                      </td>
                      <td className="px-6 py-3 text-right text-white font-medium">
                        {fmt(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {displaySchedule.length > 5 && (
              <button
                type="button"
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="w-full py-3 text-sm text-[#c7a481] hover:text-white border-t border-[#3a3a3a] flex items-center justify-center gap-2 transition"
              >
                {showFullSchedule ? (
                  <>
                    <ChevronUp size={16} /> Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} /> Show All {displaySchedule.length}{" "}
                    {scheduleView === "annual" ? "Years" : "Months"}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* ── Action Buttons ── */}
        {results && (
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
              onClick={() => router.push("/")}
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
        )}
      </div>
    </div>
  );
}
