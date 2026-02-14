/* eslint-disable @next/next/no-img-element */

"use client";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormInput({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  title,
  icon,
  select = false,
  options = [],
  isPassword = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-5 text-[#c7a481]">
          {label}
        </label>
      )}

      <TextField
        fullWidth
        variant="outlined"
        label={title}
        placeholder={placeholder}
        type={inputType}
        select={select}
        error={!!error}
        helperText={error?.message}
        {...register(name)}
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start">
              <span className="text-[#c7a481]">{icon}</span>
            </InputAdornment>
          ) : null,
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#c7a481] hover:text-[#d4b59f] transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </InputAdornment>
          ) : null,
        }}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: {
                backgroundColor: "#1a1a1a",
                color: "#fff",
                "& .MuiMenuItem-root": {
                  "&:hover": {
                    backgroundColor: "#2a2a2a",
                  },
                },
              },
            },
          },
        }}
        sx={{
          "& .MuiInputBase-root": {
            backgroundColor: "#111",
            color: "#fff",
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c7a481",
          },

          // 🚫 Disable hover border change
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c7a481",
          },

          // ✅ Focus border (same color or change if you want)
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#c7a481",
            },

          "& .MuiInputLabel-root": {
            color: "#aaa",
          },

          "& .MuiInputLabel-root.Mui-focused": {
            color: "#c7a481",
          },

          "& .MuiFormHelperText-root": {
            color: "#c7a481",
          },

          "& .MuiSelect-icon": {
            color: "#c7a481",
          },
          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, \
 & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c7a481",
          },
          "& input[type='date']::-webkit-calendar-picker-indicator": {
            filter: "invert(1)", // makes it white
            cursor: "pointer",
          },
          "& .MuiInputBase-root": {
            backgroundColor: "#111",
            color: "#fff",
          },

          "& input:-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px #111 inset",
            WebkitTextFillColor: "#fff",
            transition: "background-color 5000s ease-in-out 0s",
            caretColor: "#fff",
          },

          "& input:-webkit-autofill:hover": {
            WebkitBoxShadow: "0 0 0 1000px #111 inset",
            WebkitTextFillColor: "#fff",
          },

          "& input:-webkit-autofill:focus": {
            WebkitBoxShadow: "0 0 0 1000px #111 inset",
            WebkitTextFillColor: "#fff",
          },
        }}
      >
        {select &&
          options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                backgroundColor: "transparent !important",
                color: "#fff",

                "&:hover": {
                  backgroundColor: "#2a2a2a !important",
                },

                "&.Mui-selected": {
                  backgroundColor: "#2a2a2a !important",
                  color: "#c7a481",
                },

                "&.Mui-selected:hover": {
                  backgroundColor: "#3a3a3a !important",
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
      </TextField>
    </div>
  );
}
