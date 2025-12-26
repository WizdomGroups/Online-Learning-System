import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Plus, X } from "lucide-react";
import debounce from "lodash/debounce";

interface Option {
  label: string;
  value: string | number;
}

interface SelectFieldProps {
  label?: string;
  options: Option[];
  value?: string | number | undefined | (string | number)[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  name?: string;
  className?: string;
  error?: string;
  placeholder?: string;
  isSearchable?: boolean;
  isInfiniteScroll?: boolean;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  customDropdown?: boolean;
  disabled?: boolean;
  addButtonPath?: string;
  addButtonText?: string;
  showAddButton?: boolean;
  isMultiSelect?: boolean;
}

// Add these styles at the top of the file after imports
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    display: block !important;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 20px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
    border: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }
`;

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  value = "",
  onChange,
  required = false,
  name,
  className = "",
  error,
  placeholder = "Select...",
  isSearchable = false,
  isInfiniteScroll = false,
  onSearch,
  onLoadMore,
  loading = false,
  customDropdown = false,
  disabled = false,
  addButtonPath,
  showAddButton = false,
  isMultiSelect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  // Handle single select mode
  useEffect(() => {
    if (!isMultiSelect) {
      const option = options.find((opt) => String(opt.value) === String(value));
      setSelectedOption(option || null);
    }
  }, [value, options, isMultiSelect]);

  // Handle multi-select mode
  useEffect(() => {
    if (isMultiSelect && Array.isArray(value)) {
      const selected = options.filter((opt) =>
        value.some((val) => String(val) === String(opt.value))
      );
      setSelectedOptions(selected);
    } else if (isMultiSelect && !Array.isArray(value)) {
      setSelectedOptions([]);
    }
  }, [value, options, isMultiSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add style tag for scrollbar
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.textContent = scrollbarStyles;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const debouncedSearch = debounce((query: string) => {
    onSearch?.(query);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isInfiniteScroll || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      onLoadMore?.();
    }
  };

  const handleOptionSelect = (option: Option) => {
    if (disabled) return;

    if (isMultiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(
        (val) => String(val) === String(option.value)
      );

      let newValues: (string | number)[];
      if (isSelected) {
        newValues = currentValues.filter(
          (val) => String(val) !== String(option.value)
        );
      } else {
        newValues = [...currentValues, option.value];
      }

      const syntheticEvent = {
        target: {
          name,
          value: newValues,
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(syntheticEvent);
    } else {
      const syntheticEvent = {
        target: {
          name,
          value: option.value,
        },
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(syntheticEvent);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (disabled) return;

    if (isMultiSelect) {
      const syntheticEvent = {
        target: {
          name,
          value: [],
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange?.(syntheticEvent);
    } else {
      const syntheticEvent = {
        target: {
          name,
          value: "",
        },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange?.(syntheticEvent);
    }
  };

  const labelClasses = "text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1";
  const inputBaseClasses = "w-full py-3 px-4 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-300";
  const inputStateClasses = error
    ? "border-red-400 focus:border-red-500 bg-red-50/50"
    : "border-slate-200 focus:border-teal-600 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)]";
  const disabledClasses = disabled ? "opacity-60 cursor-not-allowed bg-slate-100" : "";

  if (!customDropdown) {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <div className="flex justify-between items-center">
            <label className={labelClasses}>
              {label} {required && <span className="text-teal-600">*</span>}
            </label>
          </div>
        )}
        <div className="relative">
          <select
            name={name}
            value={
              isMultiSelect
                ? Array.isArray(value)
                  ? value.map(String)
                  : []
                : String(value || "")
            }
            onChange={onChange}
            disabled={disabled}
            multiple={isMultiSelect}
            className={`${inputBaseClasses} ${inputStateClasses} ${disabledClasses} pr-10 appearance-none`}
          >
            <option value="" disabled hidden>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
            <ChevronDown size={14} strokeWidth={2.5} />
          </div>
        </div>
        {error && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{error}</span>}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1.5 w-full ${className}`}
      ref={dropdownRef}
    >
      {label && (
        <div className="flex justify-between items-center">
          <label className={labelClasses}>
            {label} {required && <span className="text-teal-600">*</span>}
          </label>
        </div>
      )}
      <div className="relative">
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              if (!isOpen && isSearchable) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
            }
          }}
          className={`${inputBaseClasses} ${inputStateClasses} ${disabledClasses} cursor-pointer flex justify-between items-center min-w-0 overflow-hidden ${isOpen ? 'ring-2 ring-teal-500/20 border-teal-600 bg-white' : ''}`}
        >
          <div className="flex flex-wrap gap-2 items-center min-w-0 flex-1 overflow-hidden">
            {isMultiSelect && selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <div
                  key={String(opt.value)}
                  className="flex items-center bg-teal-50 text-teal-800 border border-teal-100 rounded-lg px-2 py-0.5 text-xs font-semibold max-w-[200px] min-w-0"
                  title={opt.label}
                >
                  <span className="truncate flex-1 min-w-0">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(opt);
                    }}
                    className="ml-1.5 text-teal-400 hover:text-teal-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <span
                className={`${selectedOption ? "text-slate-700 font-semibold" : "text-slate-400 font-medium"} text-sm truncate block w-full min-w-0`}
                title={selectedOption?.label || placeholder}
              >
                {selectedOption?.label || placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2">
            {((isMultiSelect && selectedOptions.length > 0) ||
              (!isMultiSelect && selectedOption)) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
                  title="Clear selection"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}

            <ChevronDown
              size={14}
              strokeWidth={2.5}
              className={`text-slate-400 transition-transform duration-300 ${isOpen ? "transform rotate-180 text-teal-600" : ""
                }`}
            />
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-[9999] w-full mt-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden">
              {isSearchable && (
                <div className="p-2 border-b border-slate-50 relative flex items-center bg-slate-50/50">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Type to search..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 text-slate-700 placeholder:text-slate-400"
                    />
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    />
                  </div>
                  {showAddButton && addButtonPath && (
                    <a
                      href={addButtonPath}
                      className="ml-2 flex items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 transition-colors h-8 w-8 shadow-sm"
                      tabIndex={-1}
                    >
                      <Plus size={16} />
                    </a>
                  )}
                </div>
              )}

              <div
                className="max-h-[220px] overflow-y-auto custom-scrollbar"
                style={{
                  minHeight: "100px",
                }}
                onScroll={(e) => {
                  e.stopPropagation();
                  handleScroll(e);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-1">
                  {options.length > 0
                    ? options.map((option) => {
                      const isSelected = isMultiSelect
                        ? Array.isArray(value) &&
                        value.some(
                          (val) => String(val) === String(option.value)
                        )
                        : String(value) === String(option.value);

                      return (
                        <div
                          key={String(option.value)}
                          onClick={() => handleOptionSelect(option)}
                          className={`px-3 py-2.5 my-0.5 text-sm cursor-pointer rounded-lg flex items-center gap-3 transition-colors
                            ${isSelected
                              ? "bg-teal-50 text-teal-900 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          title={option.label}
                        >
                          {isMultiSelect && (
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-teal-600 border-teal-600" : "border-slate-300 bg-white"}`}>
                              {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          )}
                          <span className="truncate min-w-0 flex-1">
                            {option.label}
                          </span>
                        </div>
                      );
                    })
                    : !loading && (
                      <div className="px-4 py-8 text-xs font-bold text-slate-400 text-center uppercase tracking-wider">
                        No results found
                      </div>
                    )}
                  {loading && (
                    <div className="px-4 py-4 text-xs font-bold text-teal-600 text-center uppercase tracking-wider animate-pulse">
                      Loading Data...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{error}</span>}
    </div>
  );
};

export default SelectField;
