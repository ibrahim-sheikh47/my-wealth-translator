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

export default function SignupPage() {
  const { signup, isLoading, error, dismissError } = useAuth();

  const {
    register,
    handleSubmit,
    setValue, // Used to manually update the formatted value
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

  // --- MASKING LOGIC WITHOUT LIBRARIES ---
  const handlePhoneChange = (e) => {
    // Remove non-digits and slice to 10 immediately
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    // Update the form state
    setValue("phoneNumber", value, { shouldValidate: true });
  };
  const onSubmit = async (data) => {
    dismissError();
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("location", data.location);

    // Clean data for the backend (+11234567890)
    const cleanPhone = data.phoneNumber.replace(/\D/g, "");
    formData.append("phoneNumber", `+1${cleanPhone}`);

    formData.append("password", data.password);
    await signup(formData);
  };

  return (
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

          <h1 className="md:text-2xl font-bold text-[#c7a481] mb-1">
            My Wealth Translator
          </h1>
          <h2 className="text-lg font-semibold text-[#c7a481] mb-10">
            The Financial Co-Pilot
          </h2>
           <h1 className="text-xl font-semibold text-white mb-1">
            Don’t have an account
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
                maxLength={10} // Physical limit for keystrokes
                inputMode="numeric" // Opens number pad on mobile
                type="tel" // Semantic type for phone numbers
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

          <Btn
            title={isLoading ? "Creating account..." : "Sign Up"}
            type="submit"
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
  );
}
