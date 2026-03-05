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

  // ── Pre-fill from latest saved Firestore report on mount ──────────────────
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
  }, []); // run once on mount

  const loanAmount = watch("loanAmount");
  const interestRate = watch("interestRate");
  const loanTerm = watch("loanTerm");
  const extraPayment = watch("extraPayment");

  const [scheduleView, setScheduleView] = useState("annual");
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle"|"saving"|"saved"|"error"

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

    const monthsSaved = extra > 0 ? years * 12 - month : 0;
    const originalInterest = baseMonthly * n - P;
    const actualTotalPayment = P + totalInterest;
    const interestSaved = extra > 0 ? originalInterest - totalInterest : 0;

    return {
      monthly: baseMonthly,
      totalPayment: actualTotalPayment,
      totalInterest,
      monthsSaved,
      interestSaved,
      schedule: { monthly: monthlySchedule, annual: annualSchedule },
    };
  }, [loanAmount, interestRate, loanTerm, extraPayment]);

  const displaySchedule = results
    ? scheduleView === "annual"
      ? results.schedule.annual
      : results.schedule.monthly
    : [];
  const visibleRows = showFullSchedule
    ? displaySchedule
    : displaySchedule.slice(0, 5);

  // ── Save to Firestore ──────────────────────────────────────────────────────
  // Stored under: users/{uid}/amortization_reports/{auto-id}
  const handleSave = async () => {
    if (!results) return;
    if (!user?.uid) {
      alert("Please log in to save reports.");
      return;
    }

    setSaveStatus("saving");
    try {
      await addDoc(collection(db, "users", user.uid, "amortization_reports"), {
        // Input values (for pre-filling the form on revisit)
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        loanTerm: loanTerm,
        extraPayment: parseFloat(extraPayment) || 0,
        // Computed summary
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

  // ── Export CSV ─────────────────────────────────────────────────────────────
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
        {/* Header */}
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

            {results &&
              parseFloat(extraPayment) > 0 &&
              results.monthsSaved > 0 && (
                <div className="bg-[#111] border border-[#c7a481]/20 rounded-xl p-4">
                  <p className="text-[#c7a481] text-sm font-semibold mb-1">
                    💡 Extra Payment Impact
                  </p>
                  <p className="text-zinc-400 text-xs">
                    You&apos;ll pay off{" "}
                    <span className="text-white font-medium">
                      {Math.floor(results.monthsSaved / 12)}y{" "}
                      {results.monthsSaved % 12}mo
                    </span>{" "}
                    early and save{" "}
                    <span className="text-white font-medium">
                      {fmt(results.interestSaved)}
                    </span>{" "}
                    in interest.
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
