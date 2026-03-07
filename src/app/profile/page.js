// app/profile/page.jsx

"use client";

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import {
  ArrowLeft,
  Camera,
  User,
  ChevronDown,
  ChevronUp,
  BarChart2,
  TrendingUp,
  Calculator,
  PieChart,
  Bell,
  ShieldCheck,
  Sliders,
  Headphones,
  Send,
  Pencil,
} from "lucide-react";

// ─── Sub-components ────────────────────────────────────────────────────────────

const InputField = ({ label, value, type = "text", onChange }) => (
  <div className="relative">
    <label className="absolute -top-2.5 left-3 px-1 text-xs text-[#c7a481] bg-[#1a1a1a] font-medium tracking-wide">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full bg-transparent border border-zinc-700 rounded-lg px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#c7a481]/70 transition-colors placeholder:text-zinc-600"
    />
  </div>
);

const ReportCard = ({
  icon: Icon,
  label,
  color = "#c7a481",
  onClick,
  loading,
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl bg-[#1e1e1e] border border-zinc-800 hover:border-[#c7a481]/40 hover:bg-[#c7a481]/5 transition-all duration-200 group disabled:opacity-60"
  >
    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
      {loading ? "Loading…" : label}
    </span>
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={16} style={{ color }} />
    </div>
  </button>
);

const SettingRow = ({ icon: Icon, label }) => (
  <button className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl bg-[#1e1e1e] border border-zinc-800 hover:border-[#c7a481]/40 hover:bg-[#c7a481]/5 transition-all duration-200 group">
    <div className="flex items-center gap-3">
      <Icon
        size={16}
        className="text-zinc-500 group-hover:text-[#c7a481] transition-colors"
      />
      <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
    <ChevronDown size={14} className="text-zinc-600 rotate-[-90deg]" />
  </button>
);

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${open ? "border-[#c7a481]/40 bg-[#c7a481]/5" : "border-zinc-800 bg-[#1e1e1e]"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3.5 text-left"
      >
        <span
          className={`text-sm font-medium transition-colors ${open ? "text-[#c7a481]" : "text-zinc-400"}`}
        >
          {question}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-[#c7a481] flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-zinc-600 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-zinc-400 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const SectionHeading = ({ children }) => (
  <h3 className="text-base font-semibold text-white mb-3 tracking-tight">
    {children}
  </h3>
);

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const reduxUser = useSelector((state) => state.auth.user);
  const { plan } = useSelector((state) => state.userProfile);
  const router = useRouter();

  const [form, setForm] = useState({
    name: user?.displayName || "Gemma Rhodes",
    email: user?.email || "gemmarhodes@email.com",
    phone: user?.phone || "+1 (123) 456 7890",
    password: "••••••••",
  });

  const [colLoading, setColLoading] = useState(false);
  const [retirementLoading, setRetirementLoading] = useState(false);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [amortizationLoading, setAmortizationLoading] = useState(false);

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const getUID = () => reduxUser?.uid || user?.uid;

  // ── Cost-of-Living ──────────────────────────────────────────────────────────
  const handleColReport = async () => {
    const uid = getUID();
    if (!uid) {
      router.push("/living/custom-calculator");
      return;
    }
    setColLoading(true);
    try {
      const q = query(
        collection(db, "users", uid, "col_reports"),
        orderBy("savedAt", "desc"),
        limit(1),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const report = snap.docs[0].data();
        const expenseMap = Object.fromEntries(
          (report.expenses || []).map((e) => [e.name, e.from]),
        );
        const params = new URLSearchParams({
          fromState: report.fromState,
          toState: report.toState,
          income: String(report.income),
          housing: String(expenseMap.housing ?? ""),
          transportation: String(expenseMap.transportation ?? ""),
          food: String(expenseMap.food ?? ""),
          utilities: String(expenseMap.utilities ?? ""),
          healthcare: String(expenseMap.healthcare ?? ""),
        });
        router.push(`/living/custom-calculator?${params.toString()}`);
      } else {
        router.push("/living/custom-calculator");
      }
    } catch (err) {
      console.error("[handleColReport]", err);
      router.push("/living/custom-calculator");
    } finally {
      setColLoading(false);
    }
  };

  // ── Retirement ──────────────────────────────────────────────────────────────
  const handleRetirementReport = async () => {
    const uid = getUID();
    if (!uid) {
      router.push("/retirement");
      return;
    }
    setRetirementLoading(true);
    try {
      const q = query(
        collection(db, "users", uid, "retirement_reports"),
        orderBy("savedAt", "desc"),
        limit(1),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const r = snap.docs[0].data();
        const params = new URLSearchParams({
          currentAge: String(r.currentAge ?? ""),
          income: String(r.income ?? ""),
          savings: String(r.savings ?? ""),
          contribution: String(r.contribution ?? ""),
          budget: String(r.budget ?? ""),
          retirementAge: String(r.retirementAge ?? ""),
          incomeIncrease: String(r.incomeIncrease ?? ""),
          inflationRate: String(r.inflationRate ?? ""),
        });
        router.push(`/retirement?${params.toString()}`);
      } else {
        router.push("/retirement");
      }
    } catch (err) {
      console.error("[handleRetirementReport]", err);
      router.push("/retirement");
    } finally {
      setRetirementLoading(false);
    }
  };

  // ── Income ──────────────────────────────────────────────────────────────────
  const handleIncomeReport = async () => {
    const uid = getUID();
    if (!uid) {
      router.push("/income");
      return;
    }
    setIncomeLoading(true);
    try {
      const q = query(
        collection(db, "users", uid, "income_reports"),
        orderBy("savedAt", "desc"),
        limit(1),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const r = snap.docs[0].data();
        const params = new URLSearchParams({
          preTaxIncome: String(r.preTaxIncome ?? ""),
          desiredAfterTaxIncome: String(r.desiredAfterTaxIncome ?? ""),
          timeFrame: String(r.timeFrame ?? ""),
          savings: String(r.savings ?? ""),
          taxRate: String(r.taxRate ?? ""),
          inflationRate: String(r.inflationRate ?? ""),
        });
        router.push(`/income?${params.toString()}`);
      } else {
        router.push("/income");
      }
    } catch (err) {
      console.error("[handleIncomeReport]", err);
      router.push("/income");
    } finally {
      setIncomeLoading(false);
    }
  };

  // ── Amortization ────────────────────────────────────────────────────────────
  const handleAmortizationReport = () => router.push("/amortization-calculator");

  const faqData = [
    {
      question: "What is My Wealth Translator?",
      answer:
        "My Wealth Translator is a comprehensive financial planning tool that helps you understand and manage your assets, income, retirement, and employer stock plans.",
    },
    {
      question: "Can I export my results from the app?",
      answer:
        "Yes, you can export your results as spreadsheets or PDFs for easier review and sharing.",
    },
    {
      question: "Is my financial data secure in the app?",
      answer:
        "Absolutely. We use bank-level encryption and never sell your data to third parties.",
    },
    {
      question: "How do I update my personal details?",
      answer:
        "You can update your personal details right here on this profile page. Simply edit the fields and save your changes.",
    },
    {
      question: "What should I do if I need help?",
      answer:
        "You can reach our 24/7 customer service at +1 (123) 456-7891 or send us an email at mwtsupport@email.com.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-[#111111]/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
          >
            <ArrowLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-zinc-200 tracking-wide">
            Profile
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#c7a481] flex items-center justify-center text-3xl font-bold text-white ring-4 ring-[#c7a481]/20">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(form.name)}</span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-white">{form.name}</h2>
                <p className="text-sm text-zinc-500 mt-0.5">{form.email}</p>
                <span className="inline-block mt-2 text-[10px] px-3 py-1 rounded-full bg-[#c7a481]/15 text-[#c7a481] border border-[#c7a481]/25 uppercase font-bold tracking-wider">
                  {plan || "Pro"}
                </span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-5 hidden lg:block">
              <SectionHeading>Need some help?</SectionHeading>
              <div className="space-y-3">
                <a
                  href="tel:+11234567891"
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-900/20 border border-red-900/30 hover:border-red-700/50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-full bg-red-700/30 flex items-center justify-center flex-shrink-0">
                    <Headphones size={15} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 leading-none mb-0.5">
                      Contact our 24×7 Customer Service
                    </p>
                    <p className="text-sm font-semibold text-white group-hover:text-red-300 transition-colors">
                      +1 (123) 456-7891
                    </p>
                  </div>
                </a>
                <a
                  href="mailto:mwtsupport@email.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#c7a481]/10 border border-[#c7a481]/20 hover:border-[#c7a481]/40 transition-all group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#c7a481]/20 flex items-center justify-center flex-shrink-0">
                    <Send size={14} className="text-[#c7a481]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 leading-none mb-0.5">
                      Send us an email
                    </p>
                    <p className="text-sm font-semibold text-white group-hover:text-[#c7a481] transition-colors">
                      mwtsupport@email.com
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile */}
            <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <SectionHeading>Edit your profile</SectionHeading>
                <button className="flex items-center gap-1.5 text-xs text-[#c7a481] hover:text-white transition-colors font-medium">
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  label="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <InputField
                  label="Email Address"
                  value={form.email}
                  type="email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <InputField
                  label="Phone Number"
                  value={form.phone}
                  type="tel"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <InputField
                  label="Password"
                  value={form.password}
                  type="password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
              <div className="mt-5 flex justify-end">
                <button className="px-6 py-2.5 rounded-xl bg-[#c7a481] text-[#111] text-sm font-bold hover:bg-[#b8915e] transition-colors shadow-lg shadow-[#c7a481]/10">
                  Save Changes
                </button>
              </div>
            </div>

            {/* ── Saved Reports ── */}
            <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6">
              <SectionHeading>Your saved reports</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ReportCard
                  icon={BarChart2}
                  label="Cost-of-Living Reports"
                  onClick={handleColReport}
                  loading={colLoading}
                />
                <ReportCard
                  icon={PieChart}
                  label="Retirement Reports"
                  onClick={handleRetirementReport}
                  loading={retirementLoading}
                />
                <ReportCard
                  icon={TrendingUp}
                  label="Income Reports"
                  onClick={handleIncomeReport}
                  loading={incomeLoading}
                />
                <ReportCard
                  icon={Calculator}
                  label="Amortization Reports"
                  onClick={handleAmortizationReport}
                  loading={amortizationLoading}
                />
              </div>
            </div>

            {/* Settings (mobile) */}
            <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 lg:hidden">
              <SectionHeading>Settings</SectionHeading>
              <div className="space-y-2">
                {[
                  { icon: Sliders, label: "App Settings" },
                  { icon: Bell, label: "Notification Settings" },
                  { icon: User, label: "Account Settings" },
                  { icon: ShieldCheck, label: "Security and Privacy Settings" },
                ].map((s) => (
                  <SettingRow key={s.label} icon={s.icon} label={s.label} />
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6">
              <SectionHeading>Have a question?</SectionHeading>
              <div className="space-y-2">
                {faqData.map((faq) => (
                  <FAQItem
                    key={faq.question}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </div>

            {/* Help (mobile) */}
            <div className="bg-[#1a1a1a] border border-zinc-800 rounded-2xl p-6 lg:hidden">
              <SectionHeading>Need some help?</SectionHeading>
              <div className="space-y-3">
                <a
                  href="tel:+11234567891"
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-900/20 border border-red-900/30 hover:border-red-700/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-red-700/30 flex items-center justify-center flex-shrink-0">
                    <Headphones size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 leading-none mb-0.5">
                      Contact our 24×7 Customer Service
                    </p>
                    <p className="text-sm font-semibold text-white">
                      +1 (123) 456-7891
                    </p>
                  </div>
                </a>
                <a
                  href="mailto:mwtsupport@email.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#c7a481]/10 border border-[#c7a481]/20 hover:border-[#c7a481]/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#c7a481]/20 flex items-center justify-center flex-shrink-0">
                    <Send size={15} className="text-[#c7a481]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 leading-none mb-0.5">
                      Send us an email
                    </p>
                    <p className="text-sm font-semibold text-white">
                      mwtsupport@email.com
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
