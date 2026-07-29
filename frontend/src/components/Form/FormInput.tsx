import React from "react";
import { TextField, InputAdornment, TextFieldProps } from "@mui/material";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

type FormInputProps = Omit<TextFieldProps, "error" | "name"> & {
  register: UseFormRegisterReturn;
  error?: FieldError;
  icon?: React.ReactNode;
  alignIconTop?: boolean;
};

const FormInput: React.FC<FormInputProps> = ({
  register,
  error,
  icon,
  alignIconTop,
  ...rest
}) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...register}
      error={!!error}
      helperText={error?.message}
      InputProps={{
        startAdornment: icon ? (
          <InputAdornment 
            position="start" 
            sx={alignIconTop ? { alignSelf: 'flex-start', mt: 1.5 } : {}}
          >
            {icon}
          </InputAdornment>
        ) : null,
        ...rest.InputProps,
      }}
      {...rest}
    />
  );
};

export default FormInput;
