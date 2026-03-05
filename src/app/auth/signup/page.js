// app/auth/signup/page.jsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../validations/schema";
import { useAuth } from "@/app/hooks/useAuth";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Upload,
  CheckCircle2,
  Flag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FormInput from "../../components/FormInput";
import Btn from "@/app/components/Btn";

const LOCATION_OPTIONS = [
  { value: "new_york", label: "New York, NY" },
  { value: "los_angeles", label: "Los Angeles, CA" },
  { value: "chicago", label: "Chicago, IL" },
  { value: "houston", label: "Houston, TX" },
  { value: "phoenix", label: "Phoenix, AZ" },
  { value: "philadelphia", label: "Philadelphia, PA" },
  { value: "san_antonio", label: "San Antonio, TX" },
  { value: "san_diego", label: "San Diego, CA" },
  { value: "dallas", label: "Dallas, TX" },
  { value: "san_jose", label: "San Jose, CA" },
  { value: "austin", label: "Austin, TX" },
  { value: "denver", label: "Denver, CO" },
  { value: "seattle", label: "Seattle, WA" },
  { value: "boston", label: "Boston, MA" },
  { value: "miami", label: "Miami, FL" },
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
  const fileInputRef = useRef(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      countryCode: "+1", // Ensure this is set
      phoneNumber: "",
    },
  });

  const passwordValue = watch("password", "");

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type,
      )
    ) {
      setLocalError(
        "Please upload a valid image file (JPG, PNG, GIF, or WebP)",
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("File size must be less than 5MB");
      return;
    }
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
    setLocalError("");
  };

  const onSubmit = async (data) => {
    dismissError();
    setLocalError("");

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("location", data.location);

    // Directly prepend +1 or use the default value from hook-form
    formData.append(
      "phoneNumber",
      `+1${data.phoneNumber.replace(/\D/g, "")}`, // Regex cleans non-digits if needed
    );

    formData.append("password", data.password);
    formData.append("agreeToTerms", data.agreeToTerms);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    await signup(formData);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-8">
      <div className="w-full max-w-2xl border-2 border-[#2a2a2a] p-8 rounded-lg">
        <div className="text-center mb-8">
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
          <h1 className="text-xl font-semibold text-white mb-1">
            Don&apos;t have an account
          </h1>
          <p className="text-lg font-semibold text-white">
            Sign up to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-3">
            <FormInput
              label=""
              name="firstName"
              register={register}
              error={errors.firstName}
              type="text"
              placeholder="Enter your first name *"
              title=""
              icon={<User size={20} />}
            />
            <FormInput
              label=""
              name="lastName"
              register={register}
              error={errors.lastName}
              type="text"
              placeholder="Enter your last name *"
              title=""
              icon={<User size={20} />}
            />
          </div>

          <div className="flex items-center gap-3">
            <FormInput
              label=""
              name="email"
              register={register}
              error={errors.email}
              type="email"
              placeholder="Enter your email *"
              title=""
              icon={<Mail size={20} />}
            />
            <FormInput
              label=""
              name="location"
              register={register}
              error={errors.location}
              select={true}
              options={LOCATION_OPTIONS}
              placeholder="Enter your location *"
              title=""
              icon={<MapPin size={20} />}
            />
          </div>

          <div className="flex gap-2">
            <FormInput
              label=""
              name="countryCode"
              register={register}
              error={null}
              title=""
              customClass="w-24"
              icon={<span role="img" aria-label="US Flag">🇺🇸</span>}
            />
            {/* Replace the previous flex gap-2 div with this */}
            <div className="w-full">
              <FormInput
                label=""
                name="phoneNumber"
                register={register}
                error={errors.phoneNumber}
                type="tel"
                placeholder="Phone Number (e.g. 123 456 7890) *"
                title=""
                icon={<Phone size={20} />}
                customClass="w-full"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-full">
              <FormInput
                label=""
                name="password"
                register={register}
                error={errors.password}
                type="password"
                placeholder="Create your password *"
                title=""
                icon={<Lock size={20} />}
                isPassword={true}
              />
              {passwordValue && (
                <div className="mt-3 p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg">
                  <p className="text-xs text-zinc-400 mb-2">
                    Password requirements:
                  </p>
                  <div className="space-y-2">
                    {PASSWORD_REQUIREMENTS.map((req, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs"
                      >
                        <CheckCircle2
                          size={14}
                          className={
                            req.regex.test(passwordValue)
                              ? "text-[#c7a481]"
                              : "text-zinc-500"
                          }
                        />
                        <span
                          className={
                            req.regex.test(passwordValue)
                              ? "text-zinc-300"
                              : "text-zinc-500"
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
              label=""
              name="confirmPassword"
              register={register}
              error={errors.confirmPassword}
              type="password"
              placeholder="Confirm your password *"
              title=""
              icon={<Lock size={20} />}
              isPassword={true}
            />
          </div>

          {/* Photo upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-[#3a3a3a] rounded-lg hover:border-[#c7a481] transition flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <>
                <Upload size={24} className="text-[#c7a481]" />
                <span className="text-sm text-zinc-400">
                  Upload profile photo
                </span>
              </>
            )}
          </button>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              {...register("agreeToTerms")}
              className="mt-1 w-4 h-4 accent-[#c7a481] cursor-pointer"
            />
            <label
              htmlFor="agreeToTerms"
              className="text-sm text-zinc-400 cursor-pointer"
            >
              Agree to{" "}
              <Link href="/terms" className="text-[#c7a481] hover:underline">
                Terms and Conditions
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-red-400 text-xs">
              {errors.agreeToTerms.message}
            </p>
          )}

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}

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
