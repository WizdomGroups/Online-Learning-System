import React from "react";

interface TextAreaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  name?: string;
  className?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
}

const TextAreaField: React.FC<TextAreaProps> = ({
  label,
  placeholder = "",
  value = "",
  onChange,
  required = false,
  name,
  className = "",
  error,
  rows = 4,
  maxLength,
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-gray-700 font-medium">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        className={`px-4 py-2 border rounded-md bg-white text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 ${
          error
            ?  "border-orange-500 focus:ring-orange-500"
            : "border-gray-300 focus:ring-primary"
        }`}
      />
      <div className="flex justify-between items-center">
       {error && <span className="text-xs text-orange-500">{error}</span>}
        {maxLength && (
          <span className="text-xs text-gray-400 ml-auto">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextAreaField;
