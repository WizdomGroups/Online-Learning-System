import React from "react";

interface TextFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
  className?: string;
  error?: string;
  maxLength?: number;
  type?: string;
  disabled?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder = "",
  value = "",
  onChange,
  required = false,
  name,
  className = "",
  error,
  maxLength,
  type = "text",
  disabled = false,
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-gray-700 font-medium">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        disabled={disabled}
        className={`px-4 py-2 border rounded-md bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all duration-200 ${
          error
            ? "border-orange-500 focus:ring-orange-500"
            : "border-gray-300 focus:ring-primary "
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      <div className="flex justify-between items-center">
        {error && <span className="text-xs text-orange-500">{error}</span>}
        {maxLength && (
          <span className="text-xs text-gray-400 ml-auto">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextField;
