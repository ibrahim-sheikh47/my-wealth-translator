'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import FormInput from '@/app/components/FormInput';
import { useAuth } from '@/app/context/AuthContext';
import Btn from '@/app/components/Btn';
import Image from 'next/image';
// Login validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsLoading(true);

    try {
      const result = login(data.email, data.password);
      if (!result.success) {
        setApiError(result.error);
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-8">
      <div className="w-full max-w-md border-2 border-[#2a2a2a] p-8 rounded-lg">
        {/* Logo/Title Section */}
        <div className="text-center mb-12">
          <Image src="/logo.png" alt="Wealth Logo" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-1">
            Already have an account?
          </h1>
          <p className="text-lg font-semibold text-white">
            Log in to get started
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-transparent">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <FormInput
              label=""
              name="email"
              register={register}
              error={errors.email}
              type="email"
              placeholder="Enter your email address"
              title="Email"
              icon={<Mail size={20} />}
              v
            />

            {/* Password Input */}
            <div className="w-full">
              <FormInput
                label=""
                name="password"
                register={register}
                error={errors.password}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                title="Password"
                icon={<Lock size={20} />}
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

            {/* API Error Message */}
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{apiError}</p>
              </div>
            )}

            {/* Demo Credentials Info */}
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-4 py-3">
              <p className="text-zinc-400 text-xs mb-2">Demo Credentials:</p>
              <p className="text-zinc-300 text-sm">Email:demo@wealth.com </p>
              <p className="text-zinc-300 text-sm">Password: demo123</p>
            </div>

            {/* Submit Button */}
            <Btn
              type="submit"
              title="Log In"/>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Don&apos;t have an account?{' '}
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
    </div>
  );
}