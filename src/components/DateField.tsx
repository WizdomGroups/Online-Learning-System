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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
        {label} {required && <span className="text-teal-600">*</span>}
      </label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        {...(min ? { min } : {})}
        className={`w-full py-3 px-4 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-300 ${error
            ? "border-red-400 focus:border-red-500 bg-red-50/50"
            : "border-slate-200 focus:border-teal-600 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          }`}
      />
      {error && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{error}</span>}
    </div>
  );
};

export default DateField;
