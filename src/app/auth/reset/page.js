'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import FormInput from '@/app/components/FormInput';
import Btn from '@/app/components/Btn';
import { useAuth } from '@/app/context/AuthContext';
import { resetPasswordSchema } from '@/app/validations/schema';


export default function ResetPage() {
  const { sendResetCode } = useAuth(); // Assuming you have this function in AuthContext
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMessage('');
    try {
      // Call your API to send reset code
      await sendResetCode(data.email);
      setSuccessMessage('Reset code has been sent to your email!');
    } catch (error) {
      setApiError(error?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-8">
      <div className="w-full max-w-md border border-[#2a2a2a] p-8 rounded-lg">
        {/* Logo/Title Section */}
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="Wealth Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-xl font-semibold text-white mb-1">
            Reset your password?
          </h1>
          <p className="text-lg font-semibold text-white">
            Enter your one-time code
          </p>
        </div>

        {/* Reset Form Card */}
        <div className="bg-transparent">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <p className="text-white text-base">
              Please enter the code sent to your email.
            </p>

            {/* Email Input */}
            <FormInput
              label=""
              name="email"
              register={register}
              error={errors.email}
              type="email"
              placeholder="Enter your email address"
              icon={<Mail size={20} />}
            />

            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{apiError}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <Btn type="submit" title="Send Code" />
          </form>
        </div>
      </div>
    </div>
  );
}
