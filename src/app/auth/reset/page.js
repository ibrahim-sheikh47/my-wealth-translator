"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail } from "lucide-react";
import Image from "next/image";
import FormInput from "@/app/components/FormInput";
import Btn from "@/app/components/Btn";
import { useAuth } from "@/app/context/AuthContext";
import { resetPasswordSchema } from "@/app/validations/schema";

export function ResetPage() {
  // Firebase handles password reset via email link automatically.
  // This page is shown AFTER the user clicks the link in their email.
  // You can use confirmPasswordReset from Firebase here.

  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(
      // inline schema for new password
      require("yup").object({
        password: require("yup").string().min(8, "Min 8 characters").required(),
        confirmPassword: require("yup")
          .string()
          .oneOf([require("yup").ref("password")], "Passwords must match")
          .required(),
      }),
    ),
  });

  const onSubmit = async (data) => {
    // In production: use confirmPasswordReset(auth, oobCode, data.password)
    // oobCode comes from URL param: useSearchParams().get('oobCode')
    setSuccessMessage("Password reset successfully! You can now log in.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-8">
      <div className="w-full max-w-md border border-[#2a2a2a] p-8 rounded-lg">
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="Wealth Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-xl font-semibold text-white mb-1">
            Reset your password
          </h1>
          <p className="text-lg font-semibold text-white">
            Enter a new password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label=""
            name="password"
            register={register}
            error={errors.password}
            type="password"
            placeholder="New password"
            title="New Password"
            isPassword={true}
          />
          <FormInput
            label=""
            name="confirmPassword"
            register={register}
            error={errors.confirmPassword}
            type="password"
            placeholder="Confirm password"
            title="Confirm Password"
            isPassword={true}
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

          <Btn type="submit" title="Reset Password" />
        </form>
      </div>
    </div>
  );
}
