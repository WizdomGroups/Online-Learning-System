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
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-gray-700 font-medium">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-2 border rounded-md bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 pr-10 ${
            error
              ? "border-orange-500 focus:ring-orange-500"
              : "border-gray-300 focus:ring-primary "
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <span className="text-xs text-primary">{error}</span>}
    </div>
  );
};

export default PasswordField;
