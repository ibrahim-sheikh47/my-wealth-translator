"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../validations/schema";
import { useAuth } from "@/app/hooks/useAuth";
import { User, Mail, Lock, MapPin, Phone, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FormInput from "../../components/FormInput";
import Btn from "@/app/components/Btn";
import { useState } from "react";

const STATE_OPTIONS = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const PASSWORD_REQUIREMENTS = [
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
  { regex: /[!@#$%^&*]/, label: "One special character (!@#$%^&*)" },
  { regex: /.{8,}/, label: "At least 8 characters" },
];

// Loading overlay component
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-[#111] z-50 flex flex-col justify-center items-center px-4">
      <Image
        src="/logo.png"
        alt="My Wealth Translator"
        width={200}
        height={200}
        priority
        className="w-32 h-32 sm:w-40 sm:h-40 md:w-[200px] md:h-[200px]"
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl mt-4 font-semibold text-[#c7a481] mb-2 text-center">
        My Wealth Translator
      </h1>
      <h2 className="text-lg sm:text-xl font-semibold text-[#c7a481] mb-8 text-center">
        The Financial Co-Pilot
      </h2>

      {/* Animated dots */}
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#c7a481]"
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-zinc-500 text-sm">Setting up your account...</p>

      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function SignupPage() {
  const { signup, isLoading, error, dismissError } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      countryCode: "+1",
      phoneNumber: "",
    },
  });

  const passwordValue = watch("password", "");

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setValue("phoneNumber", value, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    dismissError();
    setIsCreating(true); // Show overlay immediately on submit

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("location", data.location);
    const cleanPhone = data.phoneNumber.replace(/\D/g, "");
    formData.append("phoneNumber", `+1${cleanPhone}`);
    formData.append("password", data.password);

    const result = await signup(formData);
    if (!result.success) {
      setIsCreating(false); // Hide overlay if error
    }
    // If success, useAuth redirects and overlay stays until navigation completes
  };

  return (
    <>
      {isCreating && <LoadingOverlay />}

      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-8">
        <div className="w-full max-w-2xl border-2 border-[#2a2a2a] p-8 rounded-lg">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Logo"
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
              Don't have an account
            </h1>
            <p className="text-lg font-semibold text-white">
              Sign up to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <FormInput
                name="firstName"
                register={register}
                error={errors.firstName}
                placeholder="First Name *"
                icon={<User size={20} />}
              />
              <FormInput
                name="lastName"
                register={register}
                error={errors.lastName}
                placeholder="Last Name *"
                icon={<User size={20} />}
              />
            </div>

            <div className="flex gap-3">
              <FormInput
                name="email"
                register={register}
                error={errors.email}
                type="email"
                placeholder="Email *"
                icon={<Mail size={20} />}
              />
              <FormInput
                name="location"
                register={register}
                error={errors.location}
                select
                options={STATE_OPTIONS}
                placeholder="Select State *"
                icon={<MapPin size={20} />}
              />
            </div>

            <div className="flex gap-2">
              <div className="w-24">
                <FormInput
                  name="countryCode"
                  register={register}
                  readOnly
                  disabled
                  customClass="bg-zinc-800 cursor-not-allowed opacity-70"
                  icon={<span className="text-xs">🇺🇸</span>}
                />
              </div>
              <div className="w-full">
                <FormInput
                  name="phoneNumber"
                  register={register}
                  error={errors.phoneNumber}
                  placeholder="5555555555 *"
                  icon={<Phone size={20} />}
                  maxLength={10}
                  inputMode="numeric"
                  type="tel"
                  onChange={handlePhoneChange}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-full">
                <FormInput
                  name="password"
                  register={register}
                  error={errors.password}
                  type="password"
                  placeholder="Password *"
                  isPassword
                  icon={<Lock size={20} />}
                />
                {passwordValue && (
                  <div className="mt-3 p-3 bg-[#111] border border-[#3a3a3a] rounded-lg">
                    <div className="space-y-1">
                      {PASSWORD_REQUIREMENTS.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-[10px]"
                        >
                          <CheckCircle2
                            size={12}
                            className={
                              req.regex.test(passwordValue)
                                ? "text-[#c7a481]"
                                : "text-zinc-600"
                            }
                          />
                          <span
                            className={
                              req.regex.test(passwordValue)
                                ? "text-zinc-300"
                                : "text-zinc-600"
                            }
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <FormInput
                name="confirmPassword"
                register={register}
                error={errors.confirmPassword}
                type="password"
                placeholder="Confirm Password *"
                isPassword
                icon={<Lock size={20} />}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Btn
              title={isCreating ? "Creating account..." : "Sign Up"}
              type="submit"
              disabled={isCreating}
            />
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-white hover:text-[#c7a481] underline"
              >
                Login now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
