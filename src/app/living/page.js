/* eslint-disable @next/next/no-img-element */

"use client";

import GoodMorning from "../components/GoodMorning";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { moveSchema } from "../validations/schema";
import FormInput from "../components/FormInput";
import Btn from "../components/Btn";
import { HandCoinsIcon, MapPin } from "lucide-react";

export default function Living() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(moveSchema),
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <div
      className="min-h-screen text-white px-6 py-8 lg:px-12 lg:py-12"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <GoodMorning />
      <div className="mt-10">
        <h1 className="text-4xl font-bold mb-4">
          Translate your
          <span className="text-[#c7a481]"> cost of living</span>
        </h1>

        <div className="w-full flex flex-col md:flex-row items-start gap-10">
          {/* MAP IMAGE */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 w-full space-y-6 order-2 md:order-1"
          >
            {/* CURRENT CITY */}
            <div className="space-y-2 flex-1">
              <FormInput
                label="I currently live in"
                title="City"
                name="currentCity"
                register={register}
                error={errors.currentCity}
                placeholder="San Francisco, CA"
                icon={<MapPin />}
              />
            </div>

            {/* TARGET CITY */}
            <div className="space-y-2 flex-1">
              <FormInput
                label="I want to move to"
                title="City"
                name="targetCity"
                register={register}
                error={errors.targetCity}
                placeholder="Dallas, TX"
                icon={<MapPin />}
              />
            </div>

            {/* INCOME */}
            <div className="space-y-2 mt-5">
              <FormInput
                label="My pre-tax household income is"
                title="Income"
                name="income"
                type="number"
                register={register}
                error={errors.income}
                placeholder="82000"
                icon={<HandCoinsIcon />}
              />
            </div>
            {/* SUBMIT BUTTON */}
            <div className=" mt-10">
              <Btn type="submit" title="Calculate" />
            </div>
          </form>
          <div className="flex justify-center order-1 md:order-2">
            <img
              src="/map.png"
              alt="US Map"
              className="w-150 object-contain h-110 opacity-90 rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
