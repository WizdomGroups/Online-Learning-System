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
    scrollbar-color: rgba(203, 213, 225, 1) transparent;
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
    background-color: rgba(203, 213, 225, 1);
    border-radius: 20px;
    border: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(148, 163, 184, 1);
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
    if (disabled) return; // Prevent selection when disabled

    if (isMultiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(
        (val) => String(val) === String(option.value)
      );

      let newValues: (string | number)[];
      if (isSelected) {
        // Remove option if already selected
        newValues = currentValues.filter(
          (val) => String(val) !== String(option.value)
        );
      } else {
        // Add option if not selected
        newValues = [...currentValues, option.value];
      }

      const syntheticEvent = {
        target: {
          name,
          value: newValues,
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(syntheticEvent);
      // Don't close dropdown in multi-select mode
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
    e.stopPropagation(); // Prevent dropdown toggle
    
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

  if (!customDropdown) {
    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && (
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-700 font-medium">
              {label} {required && <span className="text-[red]">*</span>}
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
            className={`px-4 py-2 pr-10 border rounded-md bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 w-full appearance-none
              ${
                error
                  ? "border-primary focus:ring-primary"
                  : "border-gray-300 focus:ring-primary-hover"
              } ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : ""}`}
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
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <span className="text-xs text-[red]">{error}</span>}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1 w-full ${className}`}
      ref={dropdownRef}
    >
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-700 font-medium">
            {label} {required && <span className="text-[red]">*</span>}
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
          className={`px-4 py-2 border rounded-md bg-white text-sm text-gray-700 cursor-pointer flex justify-between items-center min-w-0 w-full overflow-hidden
            ${error ? "border-[red]" : "border-gray-300"}
            ${isOpen && !disabled ? "ring-2 ring-primary-hover" : ""} 
            ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : ""}`}
        >
          <div className="flex flex-wrap gap-2 items-center min-w-0 flex-1 overflow-hidden">
            {isMultiSelect && selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <div
                  key={String(opt.value)}
                  className="flex items-center bg-gray-200 text-gray-800 rounded-full px-2 py-1 text-xs max-w-[200px] min-w-0"
                  title={opt.label} // Show full text on hover
                >
                  <span className="truncate flex-1 min-w-0">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dropdown toggle
                      handleOptionSelect(opt); // Remove this option
                    }}
                    className="ml-1 text-gray-500 hover:text-red-600 font-bold flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <span
                className={`${selectedOption ? "text-gray-700" : "text-gray-400"} text-sm truncate block w-full min-w-0`}
                title={selectedOption?.label || placeholder}
              >
                {selectedOption?.label || placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Clear button - only show when there are selected values */}
            {((isMultiSelect && selectedOptions.length > 0) || 
              (!isMultiSelect && selectedOption)) && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                title="Clear selection"
              >
                <X size={14} />
              </button>
            )}
            
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-[9999] w-full mt-1">
            <div className="bg-white border border-gray-200 rounded-md shadow-lg">
              {isSearchable && (
                <div className="p-2 border-b border-gray-200 relative flex items-center">
                  <div className="relative flex-1">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search..."
                      className="w-full px-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none"
                    />
                    <Search
                      size={16}
                      className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  {showAddButton && addButtonPath && (
                    <a
                      href={addButtonPath}
                      className="ml-2 flex items-center justify-center rounded-full bg-white border border-primary-hover text-[#004990] hover:bg-orange-50 transition-colors"
                      style={{ width: 18, height: 18 }}
                      tabIndex={-1}
                    >
                      <Plus size={18} />
                    </a>
                  )}
                </div>
              )}

              <div
                className="max-h-[200px] overflow-y-auto custom-scrollbar"
                style={{
                  overflowY: "auto",
                  overflowX: "hidden",
                  position: "relative",
                  minHeight: "100px",
                }}
                onScroll={(e) => {
                  e.stopPropagation();
                  handleScroll(e);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
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
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-orange-50 flex items-center gap-2
                            ${isSelected ? "bg-primary" : ""}`}
                            title={option.label} // Show full text on hover
                          >
                            {isMultiSelect && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent click
                                className="w-4 h-4 text-primary-hover rounded border-gray-300 focus:ring-primary-hover flex-shrink-0"
                              />
                            )}
                            <span className="truncate min-w-0 flex-1">
                              {option.label}
                            </span>
                          </div>
                        );
                      })
                    : !loading && (
                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                          No options found
                        </div>
                      )}
                  {loading && (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      Loading...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-[red]">{error}</span>}
    </div>
  );
};

export default SelectField;
