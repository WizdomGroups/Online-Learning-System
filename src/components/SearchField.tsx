import React from "react";
import { Search } from "lucide-react";

interface SearchFieldProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  className?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({
  label = "Search",
  value = "",
  onChange,
  placeholder = "Search...",
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
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm  placeholder-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-primary "
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
          <Search size={16} />
        </div>
      </div>
    </div>
  );
};

export default SearchField;
