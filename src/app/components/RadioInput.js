/* eslint-disable @next/next/no-img-element */

"use client";

import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import FormHelperText from "@mui/material/FormHelperText";

export default function RadioInput({
  label,
  name,
  register,
  error,
  options = [],
}) {
  return (
    <div className="w-full">
      <FormControl component="fieldset" error={!!error} fullWidth>
        <FormLabel
          component="legend"
          sx={{
            color: "#c7a481",
            fontSize: "0.875rem",
            fontWeight: 500,
            marginBottom: "1.25rem",
            "&.Mui-focused": {
              color: "#c7a481",
            },
          }}
        >
          {label}
        </FormLabel>
        <RadioGroup
        row
          {...register(name)}
          sx={{
            "& .MuiFormControlLabel-label": {
              color: "#fff",
            },
          }}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  sx={{
                    color: "#c7a481",
                    "&.Mui-checked": {
                      color: "#c7a481",
                    },
                  }}
                />
              }
              label={option.label}
            />
          ))}
        </RadioGroup>
        {error && (
          <FormHelperText sx={{ color: "#c7a481" }}>
            {error.message}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
}
