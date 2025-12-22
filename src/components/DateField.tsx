import React from "react";

interface DateFieldProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
  className?: string;
  error?: string;
  placeholder?: string;
  min?: string; // Optional min
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  value = "",
  onChange,
  required = false,
  name,
  className = "",
  error,
  placeholder = "MM/DD/YYYY",
  min, // Optional
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-gray-700 font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        {...(min ? { min } : {})} // 👈 Only apply if min is passed
        className={`px-4 py-2 border rounded-md bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 w-full
          ${
            error
              ? "border-primary focus:ring-orange-500"
              : "border-gray-300 focus:ring-primary"
          }`}
      />
      {error && <span className="text-xs text-primary">{error}</span>}
    </div>
  );
};

export default DateField;
