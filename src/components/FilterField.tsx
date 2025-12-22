import React from "react";
import { Filter } from "lucide-react";

interface FilterFieldProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  className?: string;
}

const FilterField: React.FC<FilterFieldProps> = ({
  label,
  value = "",
  onChange,
  placeholder = "Filter by name",
  name,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-black font-medium">{label}</label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-white"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
          <Filter size={16} />
        </div>
      </div>
    </div>
  );
};

export default FilterField;
