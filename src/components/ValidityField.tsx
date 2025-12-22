import React from "react";
import { Calendar } from "lucide-react";

interface ValidityFieldProps {
  label: string;
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

const ValidityField: React.FC<ValidityFieldProps> = ({
  label,
  value = "",
  onClick,
  placeholder = "Any validity period",
  className = "",
  name,
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-black font-medium">{label}</label>
      <div className="relative cursor-pointer" onClick={onClick}>
        <input
          name={name}
          type="text"
          readOnly
          value={value}
          placeholder={placeholder}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
          <Calendar size={16} />
        </div>
      </div>
    </div>
  );
};

export default ValidityField;
