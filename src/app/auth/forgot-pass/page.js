"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormInput from "@/app/components/FormInput";
import Btn from "@/app/components/Btn";
import { forgotPassSchema } from "@/app/validations/schema";
import { useAuth } from "@/app/hooks/useAuth";

export default function ForgotPassPage() {
  const router = useRouter();
  const { sendResetEmail, isLoading } = useAuth();
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(forgotPassSchema) });

  const onSubmit = async (data) => {
    setLocalError("");
    setSuccessMessage("");
    const result = await sendResetEmail(data.email);
    if (result.success) {
      // Navigate to reset page so user can enter the OTP code
      router.push(`/auth/reset?email=${encodeURIComponent(data.email)}`);
    } else {
      setLocalError(result.error);
    }
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
          <h1 className="text-xl font-bold text-[#c7a481] mb-10">
              My Wealth Translator
            </h1>
          <h1 className="text-lg font-semibold text-[#c7a481] mb-1">
            Forgot your password?
          </h1>
          <p className="text-2xl font-semibold text-white">
            Reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-white text-base">
            No worries, it happens. Simply enter your email address associated
            with your account, and we'll send you a code to reset your password.
          </p>

          <FormInput
            label=""
            name="email"
            register={register}
            error={errors.email}
            type="email"
            placeholder="Enter your email address"
            icon={<Mail size={20} />}
          />

          {localError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{localError}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <Btn type="submit" title={isLoading ? "Sending..." : "Send Code"} />
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-400 text-sm">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-white hover:text-[#c7a481] font-medium transition underline"
            >
              Login now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
