import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Autocomplete,
  TextField,
  SelectProps,
} from "@mui/material";
import { UseFormRegisterReturn, FieldError, Control, Controller } from "react-hook-form";

type FormSelectProps = Omit<SelectProps, "error" | "name" | "variant"> & {
  register?: UseFormRegisterReturn;
  control?: Control<any>;
  name?: string;
  error?: FieldError;
  icon?: React.ReactNode;
  options: { label: string; value: string | number }[] | string[];
  searchable?: boolean;
};

const FormSelect: React.FC<FormSelectProps> = ({
  register,
  control,
  name,
  error,
  icon,
  options,
  label,
  defaultValue = "",
  value,
  onChange,
  searchable = false,
  ...rest
}) => {
  const fieldName = name || register?.name || "";
  const labelId = `${fieldName}-label`;

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const renderAutocomplete = (selectValue: any, selectOnChange: any) => {
    const currentValue = selectValue !== undefined ? selectValue : (value || "");
    const selectedOption =
      normalizedOptions.find((o) => String(o.value) === String(currentValue)) || null;

    return (
      <Autocomplete
        options={normalizedOptions}
        getOptionLabel={(option) => option.label || ""}
        isOptionEqualToValue={(option, val) => String(option.value) === String(val.value)}
        value={selectedOption}
        onChange={(_e, newValue) => {
          const valToSave = newValue ? newValue.value : "";
          if (selectOnChange) selectOnChange(valToSave);
          if (onChange) (onChange as any)({ target: { name: fieldName, value: valToSave } }, valToSave);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={!!error}
            helperText={error?.message}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <React.Fragment>
                  {icon ? (
                    <InputAdornment position="start" sx={{ color: "#64748b", mr: 0.5 }}>
                      {icon}
                    </InputAdornment>
                  ) : null}
                  {params.InputProps.startAdornment}
                </React.Fragment>
              ),
            }}
            sx={{
              backgroundColor: "#f8fafc",
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                "& fieldset": {
                  borderColor: "#cbd5e1",
                },
                "&:hover fieldset": {
                  borderColor: "#0284c7",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0284c7",
                  borderWidth: "2px",
                },
              },
            }}
          />
        )}
      />
    );
  };

  const renderSelect = (selectValue: any, selectOnChange: any) => (
    <FormControl fullWidth variant="outlined" error={!!error}>
      <InputLabel id={labelId} sx={{ color: "#64748b", fontWeight: 500 }}>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={selectValue !== undefined ? selectValue : (value || "")}
        onChange={selectOnChange || onChange || register?.onChange}
        onBlur={register?.onBlur}
        inputRef={register?.ref}
        startAdornment={
          icon ? (
            <InputAdornment position="start" sx={{ color: "#64748b", mr: 1 }}>
              {icon}
            </InputAdornment>
          ) : null
        }
        sx={{
          borderRadius: "10px",
          backgroundColor: "#f8fafc",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#cbd5e1",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0284c7",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0284c7",
            borderWidth: "2px",
          },
          "& .MuiSelect-select": {
            py: 1.5,
            fontWeight: 500,
            color: "#1e293b",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "12px",
              mt: 1,
              maxHeight: 300,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)",
              "& .MuiMenuItem-root": {
                px: 2,
                py: 1.2,
                borderRadius: "6px",
                mx: 0.5,
                my: 0.25,
                fontWeight: 500,
                color: "#334155",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                  color: "#0284c7",
                },
                "&.Mui-selected": {
                  backgroundColor: "#e0f2fe",
                  color: "#0369a1",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#bae6fd",
                  },
                },
              },
            },
          },
        }}
        {...rest}
      >
        <MenuItem value="" disabled>
          <em>Select {label}</em>
        </MenuItem>
        {normalizedOptions.map((opt, index) => (
          <MenuItem key={index} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText sx={{ mx: 0.5, mt: 0.5 }}>{error.message}</FormHelperText>}
    </FormControl>
  );

  if (searchable) {
    if (control && fieldName) {
      return (
        <Controller
          name={fieldName}
          control={control}
          defaultValue={defaultValue}
          render={({ field }) => renderAutocomplete(field.value, field.onChange)}
        />
      );
    }
    return renderAutocomplete(value, onChange);
  }

  if (control && fieldName) {
    return (
      <Controller
        name={fieldName}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => renderSelect(field.value, field.onChange)}
      />
    );
  }

  return renderSelect(value, onChange);
};

export default FormSelect;
