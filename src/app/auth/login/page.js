// app/auth/login/page.jsx
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FormInput from "@/app/components/FormInput";
import Btn from "@/app/components/Btn";
import { useAuth } from "@/app/hooks/useAuth";
// ✅ FIX: Removed unused `useEffect` and `useRouter` imports that were
// causing React to complain and potentially triggering hydration mismatches.

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const { login, isLoading, error, dismissError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    dismissError();
    await login(data.email, data.password);
    // Navigation handled inside useAuth.login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-8">
      <div className="w-full max-w-md border-2 border-[#2a2a2a] p-8 rounded-lg">
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="Wealth Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="md:text-2xl text-xl font-bold text-[#c7a481] mb-1">
            My Wealth Translator
          </h1>
          <h2 className="md:text-lg font-semibold text-[#c7a481] mb-10">
            The Financial Co-Pilot
          </h2>
          <h1 className="text-xl font-semibold text-white mb-1">
            Already have an account?
          </h1>
          <p className="text-lg font-semibold text-white">
            Log in to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label=""
            name="email"
            register={register}
            error={errors.email}
            type="email"
            placeholder="Enter your email address"
            title="Email"
            icon={<Mail size={20} />}
          />

          <div className="w-full">
            <FormInput
              label=""
              name="password"
              register={register}
              error={errors.password}
              type="password"
              placeholder="Enter your password"
              title="Password"
              icon={<Lock size={20} />}
              isPassword={true}
            />
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-pass"
                className="text-sm font-semibold text-zinc-400 hover:text-[#c7a481] transition"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Btn type="submit" title={isLoading ? "Logging in..." : "Log In"} />
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-white hover:text-[#c7a481] font-medium transition underline"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
