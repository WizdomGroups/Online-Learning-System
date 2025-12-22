import React, { useMemo, useEffect } from "react";
import Select, {
  StylesConfig,
  GroupBase,
  components,
  DropdownIndicatorProps,
  ClearIndicatorProps,
  MultiValueRemoveProps,
  OptionProps,
} from "react-select";
import { ChevronDown, X, AlertCircle, Check } from "lucide-react";

// Add scrollbar styles to match SelectField
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

interface OptionType {
  label: string;
  value: string;
  disabled?: boolean;
  color?: string;
  description?: string;
}

interface MultiSelectFieldProps {
  label?: string;
  name: string;
  options: OptionType[];
  value: OptionType[];
  onChange: (selected: OptionType[]) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
  maxItems?: number;
  searchable?: boolean;
  clearable?: boolean;
  closeMenuOnSelect?: boolean;
  hideSelectedOptions?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  noOptionsMessage?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "filled";
}

const DropdownIndicator = (props: DropdownIndicatorProps<OptionType, true>) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown className="h-4 w-4 text-gray-400" />
  </components.DropdownIndicator>
);

const ClearIndicator = (props: ClearIndicatorProps<OptionType, true>) => (
  <components.ClearIndicator {...props}>
    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
  </components.ClearIndicator>
);

const MultiValueRemove = (props: MultiValueRemoveProps<OptionType, true>) => (
  <components.MultiValueRemove {...props}>
    <X className="h-3 w-3" />
  </components.MultiValueRemove>
);

const Option = (props: OptionProps<OptionType, true>) => {
  const { isSelected, children } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
            isSelected
              ? "bg-[#5b8db5] border-[#5b8db5] text-white"
              : "border-gray-300 hover:border-[#5b8db5] bg-white"
          }`}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </div>
        <span className="flex-1">{children}</span>
      </div>
    </components.Option>
  );
};

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label = "Select",
  options,
  value,
  name,
  onChange,
  placeholder = "Select options...",
  required = false,
  error,
  className = "",
  disabled = false,
  maxItems,
  searchable = true,
  clearable = true,
  closeMenuOnSelect = false,
  hideSelectedOptions = false,
  loading = false,
  loadingMessage = "Loading...",
  noOptionsMessage = "No options available",
  size = "md",
  variant = "default",
}) => {
  // Add style tag for scrollbar to match SelectField
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.textContent = scrollbarStyles;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);
  const sizeConfig = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          minHeight: "36px",
          fontSize: "13px",
          multiValuePadding: "1px 4px",
        };
      case "lg":
        return {
          minHeight: "48px",
          fontSize: "16px",
          multiValuePadding: "4px 8px",
        };
      default:
        return {
          minHeight: "40px", // matches TextField height
          fontSize: "14px", // text-sm
          multiValuePadding: "2px 6px",
        };
    }
  }, [size]);

  const variantConfig = useMemo(() => {
    switch (variant) {
      case "outline":
        return {
          backgroundColor: "white",
          borderWidth: "2px",
        };
      case "filled":
        return {
          backgroundColor: "#f3f4f6",
          borderWidth: "1px",
        };
      default:
        return {
          backgroundColor: "white",
          borderWidth: "1px",
        };
    }
  }, [variant]);

  const isMaxItemsReached = !!maxItems && value.length >= maxItems;

  const filteredOptions = useMemo(() => {
    if (isMaxItemsReached) {
      return options.filter((option) =>
        value.some((v) => v.value === option.value)
      );
    }
    return options;
  }, [options, value, isMaxItemsReached]);

  const customStyles: StylesConfig<OptionType, true, GroupBase<OptionType>> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: sizeConfig.minHeight,
      fontSize: sizeConfig.fontSize,
      paddingTop: "2px",
      paddingBottom: "2px",
      paddingLeft: "12px",
      paddingRight: "12px",
      border: error
        ? "1px solid #f97316"
        : state.isFocused
        ? "1px solid #5b8db5"
        : `1px solid #d1d5db`,
      borderRadius: "6px",
      backgroundColor: disabled ? "#f9fafb" : variantConfig.backgroundColor,
      boxShadow: state.isFocused
        ? "0 0 0 1px rgba(91, 141, 181, 0.3)"
        : "0 1px 2px rgba(0, 0, 0, 0.05)",
      cursor: disabled ? "not-allowed" : "default",
      transition: "all 0.2s ease-in-out",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#f1f5f9",
      borderRadius: "6px",
      padding: sizeConfig.multiValuePadding,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#374151",
      fontSize: "13px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        backgroundColor: "#ef4444",
        color: "white",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#5b8db5"
        : state.isFocused
        ? "rgba(91, 141, 181, 0.1)"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      fontSize: sizeConfig.fontSize,
      cursor: state.isDisabled ? "not-allowed" : "pointer",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
      overflowY: "auto",
      overflowX: "hidden",
      padding: "4px 0",
    }),
    input: (provided) => ({
      ...provided,
      fontSize: sizeConfig.fontSize,
      color: "#374151",
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: sizeConfig.fontSize,
      color: "#9ca3af",
    }),
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm text-gray-700 font-medium">
            {label} {required && <span className="text-orange-500">*</span>}
            {maxItems && (
              <span className="text-xs text-gray-500 ml-2">
                ({value.length}/{maxItems})
              </span>
            )}
          </label>
        </div>
      )}

      <Select
        name={name}
        isMulti
        options={filteredOptions}
        value={value}
        onChange={(selected) => onChange(selected as OptionType[])}
        placeholder={
          isMaxItemsReached ? `Maximum ${maxItems} items` : placeholder
        }
        styles={customStyles}
        classNamePrefix="react-select"
        className="react-select-container"
        isSearchable={searchable}
        isClearable={clearable}
        isDisabled={disabled || isMaxItemsReached}
        closeMenuOnSelect={closeMenuOnSelect}
        hideSelectedOptions={hideSelectedOptions}
        isLoading={loading}
        loadingMessage={() => loadingMessage}
        noOptionsMessage={() => noOptionsMessage}
        components={{
          DropdownIndicator,
          ClearIndicator,
          MultiValueRemove,
          Option,
        }}
        isOptionDisabled={(option) => option.disabled || false}
        formatOptionLabel={(option) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {option.color && (
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span>{option.label}</span>
            </div>
            {option.description && (
              <span className="text-xs text-gray-500 ml-2">
                {option.description}
              </span>
            )}
          </div>
        )}
      />

      {error && <span className="text-xs text-orange-500">{error}</span>}

      {maxItems && isMaxItemsReached && (
        <div className="flex items-center gap-1 mt-1 text-sm text-orange-500">
          <AlertCircle className="w-4 h-4" />
          <span>Maximum number of items selected</span>
        </div>
      )}
    </div>
  );
};

export default MultiSelectField;
