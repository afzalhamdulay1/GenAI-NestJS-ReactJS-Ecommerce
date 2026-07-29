import React from "react";
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, InputAdornment, SelectProps } from "@mui/material";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

type FormSelectProps = Omit<SelectProps, "error" | "name" | "variant"> & {
  register: UseFormRegisterReturn;
  error?: FieldError;
  icon?: React.ReactNode;
  options: { label: string; value: string | number }[] | string[];
};

const FormSelect: React.FC<FormSelectProps> = ({
  register,
  error,
  icon,
  options,
  label,
  ...rest
}) => {
  const labelId = `${register.name}-label`;

  return (
    <FormControl fullWidth variant="outlined" error={!!error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        defaultValue=""
        {...register}
        startAdornment={
          icon ? (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ) : null
        }
        {...rest}
      >
        {options.map((opt, index) => {
          const value = typeof opt === "string" ? opt : opt.value;
          const displayLabel = typeof opt === "string" ? opt : opt.label;
          return (
            <MenuItem key={index} value={value}>
              {displayLabel}
            </MenuItem>
          );
        })}
      </Select>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
};

export default FormSelect;
