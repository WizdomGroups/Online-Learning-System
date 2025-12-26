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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Search often doesn't need a visible label in top bars, but if present: */}
      {label && label !== "Search" && (
        <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300"
        />
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default SearchField;
