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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
        {label} {required && <span className="text-teal-600">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full py-3 px-4 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-300 ${error
            ? "border-red-400 focus:border-red-500 bg-red-50/50"
            : "border-slate-200 focus:border-teal-600 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          } ${disabled ? "opacity-60 cursor-not-allowed bg-slate-100" : ""}`}
      />
      <div className="flex justify-between items-center ml-1">
        {error && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</span>}
        {maxLength && (
          <span className="text-[10px] text-slate-400 font-bold ml-auto">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextField;
