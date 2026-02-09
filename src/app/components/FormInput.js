// components/FormInput.jsx
"use client";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

export default function FormInput({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  title,
  icon,
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-5 text-[#c7a481]">
        {label}
      </label>

      <TextField
        fullWidth
        variant="outlined"
        label={title}
        placeholder={placeholder}
        type={type}
        error={!!error}
        helperText={error?.message}
        {...register(name)}
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start">
              <span className="text-[#c7a481]">{icon}</span>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          "& .MuiInputBase-root": {
            backgroundColor: "#111",
            color: "#fff",
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c7a481",
          },

          "& .MuiInputLabel-root": {
            color: "#aaa",
          },

          // 🔥 Focused label color
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#c7a481",
          },

          // 🔥 Focused border color
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#c7a481",
            },

          "& .MuiFormHelperText-root": {
            color: "#c7a481",
          },
          // Remove number input arrows (Chrome, Edge, Safari)
          "& input[type=number]::-webkit-outer-spin-button, \
 & input[type=number]::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },

          // Remove number input arrows (Firefox)
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
        }}
      />
    </div>
  );
}
