/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { moveSchema } from "../validations/schema";
import FormInput from "../components/FormInput";
import Btn from "../components/Btn";
import GoodMorning from "../components/GoodMorning";
import { HandCoinsIcon, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
} from "@mui/material";

// --- Full US States List ---
const US_STATES = [
  { label: "Alabama", value: "Alabama" },
  { label: "Alaska", value: "Alaska" },
  { label: "Arizona", value: "Arizona" },
  { label: "Arkansas", value: "Arkansas" },
  { label: "California", value: "California" },
  { label: "Colorado", value: "Colorado" },
  { label: "Connecticut", value: "Connecticut" },
  { label: "Delaware", value: "Delaware" },
  { label: "Florida", value: "Florida" },
  { label: "Georgia", value: "Georgia" },
  { label: "Hawaii", value: "Hawaii" },
  { label: "Idaho", value: "Idaho" },
  { label: "Illinois", value: "Illinois" },
  { label: "Indiana", value: "Indiana" },
  { label: "Iowa", value: "Iowa" },
  { label: "Kansas", value: "Kansas" },
  { label: "Kentucky", value: "Kentucky" },
  { label: "Louisiana", value: "Louisiana" },
  { label: "Maine", value: "Maine" },
  { label: "Maryland", value: "Maryland" },
  { label: "Massachusetts", value: "Massachusetts" },
  { label: "Michigan", value: "Michigan" },
  { label: "Minnesota", value: "Minnesota" },
  { label: "Mississippi", value: "Mississippi" },
  { label: "Missouri", value: "Missouri" },
  { label: "Montana", value: "Montana" },
  { label: "Nebraska", value: "Nebraska" },
  { label: "Nevada", value: "Nevada" },
  { label: "New Hampshire", value: "New Hampshire" },
  { label: "New Jersey", value: "New Jersey" },
  { label: "New Mexico", value: "New Mexico" },
  { label: "New York", value: "New York" },
  { label: "North Carolina", value: "North Carolina" },
  { label: "North Dakota", value: "North Dakota" },
  { label: "Ohio", value: "Ohio" },
  { label: "Oklahoma", value: "Oklahoma" },
  { label: "Oregon", value: "Oregon" },
  { label: "Pennsylvania", value: "Pennsylvania" },
  { label: "Rhode Island", value: "Rhode Island" },
  { label: "South Carolina", value: "South Carolina" },
  { label: "South Dakota", value: "South Dakota" },
  { label: "Tennessee", value: "Tennessee" },
  { label: "Texas", value: "Texas" },
  { label: "Utah", value: "Utah" },
  { label: "Vermont", value: "Vermont" },
  { label: "Virginia", value: "Virginia" },
  { label: "Washington", value: "Washington" },
  { label: "West Virginia", value: "West Virginia" },
  { label: "Wisconsin", value: "Wisconsin" },
  { label: "Wyoming", value: "Wyoming" },
];

const INCOME_RANGES = [
  { label: "$50,000 - $75,000", value: "62500" },
  { label: "$75,000 - $100,000", value: "87500" },
  { label: "$100,000 - $150,000", value: "125000" },
  { label: "$150,000 - $250,000", value: "200000" },
  { label: "-- Enter Custom Amount --", value: "custom_income" },
];

export default function Living() {
  const router = useRouter();
  const { plan, isLoading } = useSelector((state) => state.userProfile);
  const { isInitialized } = useSelector((state) => state.auth);

  // Dialog State for Income only
  const [open, setOpen] = useState(false);
  const [tempIncome, setTempIncome] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(moveSchema),
    defaultValues: {
      currentCity: "California",
      targetCity: "Texas",
      income: "87500",
    },
  });

  const watchedIncome = watch("income");

  // Trigger dialog when "custom_income" is selected
  useEffect(() => {
    if (watchedIncome === "custom_income") {
      setOpen(true);
    }
  }, [watchedIncome]);

  const handleIncomeSubmit = () => {
    if (tempIncome) {
      setValue("income", tempIncome);
    } else {
      setValue("income", "87500"); // Fallback if they leave it empty
    }
    setOpen(false);
  };

  useEffect(() => {
    if (isInitialized && !isLoading && plan === "free") {
      router.replace("/payment");
    }
  }, [plan, isLoading, isInitialized, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#c7a481]"></div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const params = new URLSearchParams({
      fromCity: data.currentCity,
      toCity: data.targetCity,
      income: data.income,
    });
    router.push(`/living/detail?${params.toString()}`);
  };

  return (
    <div
      className="min-h-screen text-white px-6 py-8 lg:px-12 lg:py-12"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <GoodMorning />
      <div className="mt-10">
        <h1 className="text-4xl font-bold mb-4">
          Translate your <span className="text-[#c7a481]"> cost of living</span>
        </h1>

        <div className="w-full flex flex-col md:flex-row items-start gap-10 md:mt-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 w-full space-y-6 order-2 md:order-1"
          >
            <FormInput
              select
              options={US_STATES}
              label="I currently live in"
              title="State"
              name="currentCity"
              register={register}
              error={errors.currentCity}
              icon={<MapPin />}
            />

            <FormInput
              select
              options={US_STATES}
              label="I want to move to"
              title="State"
              name="targetCity"
              register={register}
              error={errors.targetCity}
              icon={<MapPin />}
            />

            <FormInput
              select={watchedIncome === "custom_income" ? false : true} // Toggle to manual input if custom is set
              options={INCOME_RANGES}
              label="My pre-tax household income is"
              title="Income"
              name="income"
              type="number"
              register={register}
              error={errors.income}
              icon={<HandCoinsIcon />}
              placeholder="e.g. 82000"
            />

            <div className="mt-10">
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

      {/* --- Custom Income Dialog --- */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          if (watchedIncome === "custom_income") setValue("income", "87500");
        }}
        PaperProps={{
          sx: {
            backgroundColor: "#1a1a1a",
            color: "#fff",
            border: "1px solid #c7a481",
            borderRadius: "20px",
            padding: "10px",
            minWidth: "300px",
          },
        }}
      >
        <DialogTitle className="text-[#c7a481]">
          Custom Annual Income
        </DialogTitle>
        <DialogContent>
          <Box className="pt-2">
            <TextField
              fullWidth
              autoFocus
              type="number"
              variant="outlined"
              placeholder="Enter amount (e.g. 125000)"
              value={tempIncome}
              onChange={(e) => setTempIncome(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#3a3a3a" },
                  "&:hover fieldset": { borderColor: "#c7a481" },
                  "&.Mui-focused fieldset": { borderColor: "#c7a481" },
                },
              }}
            />
          </Box>
          <Box className="flex justify-end gap-3 mt-5">
            <Button
              onClick={() => {
                setOpen(false);
                setValue("income", "87500");
              }}
              sx={{ color: "#aaa" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleIncomeSubmit}
              variant="contained"
              sx={{
                backgroundColor: "#c7a481",
                "&:hover": { backgroundColor: "#b38f6d" },
              }}
            >
              Set Income
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
