import React from "react";

interface TimeFieldProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
  className?: string;
  error?: string;
  placeholder?: string;
}

const TimeField: React.FC<TimeFieldProps> = ({
  label,
  value = "",
  onChange,
  required = false,
  name,
  className = "",
  error,
  placeholder = "00:00:00",
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm text-gray-700 font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type="time"
        step="1"
        name={name}
        value={value || "00:00:00"} // fallback to default time if value is invalid
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`px-4 py-2 border rounded-md bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 w-full
    ${
      error
        ? "border-primary focus:ring-primary"
        : "border-gray-300 focus:ring-orange-500"
    }
  `}
      />
      {error && <span className="text-xs text-primary">{error}</span>}
    </div>
  );
};

export default TimeField;

// import React from "react";
// import TimePicker from "react-time-picker";
// import "react-time-picker/dist/TimePicker.css";
// import "react-clock/dist/Clock.css";

// interface TimeFieldProps {
//   label: string;
//   value?: string;
//   onChange?: (value: string) => void;
//   required?: boolean;
//   name?: string;
//   className?: string;
//   error?: string;
//   placeholder?: string;
// }

// const TimeField: React.FC<TimeFieldProps> = ({
//   label,
//   value = "",
//   onChange,
//   required = false,
//   name,
//   className = "",
//   error,
//   placeholder = "Select time",
// }) => {
//   return (
//     <div className={`flex flex-col gap-1 w-full ${className}`}>
//       <label className="text-sm text-gray-700 font-medium">
//         {label} {required && <span className="text-primary">*</span>}
//       </label>
//       <TimePicker
//         name={name}
//         value={value}
//         onChange={onChange}
//         disableClock
//         format="HH:mm:ss"
//         className={`react-time-picker w-full text-sm ${
//           error ? "border border-primary" : "border border-gray-300"
//         } rounded-md px-3 py-2 focus:outline-none`}
//         clearIcon={null}
//         required={required}
//         placeholder={placeholder}
//       />
//       {error && <span className="text-xs text-primary">{error}</span>}
//     </div>
//   );
// };

// export default TimeField;
