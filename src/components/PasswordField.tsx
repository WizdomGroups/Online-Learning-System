import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface PasswordFieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
  className?: string;
  error?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  placeholder = "",
  value = "",
  onChange,
  required = false,
  name,
  className = "",
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
        {label} {required && <span className="text-teal-600">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full py-3 pl-4 pr-11 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-300 ${error
              ? "border-red-400 focus:border-red-500 bg-red-50/50"
              : "border-slate-200 focus:border-teal-600 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{error}</span>}
    </div>
  );
};

export default PasswordField;
