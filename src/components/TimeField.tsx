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
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
        {label} {required && <span className="text-teal-600">*</span>}
      </label>
      <input
        type="time"
        step="1"
        name={name}
        value={value || "00:00:00"} // fallback to default time if value is invalid
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full py-3 px-4 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all duration-300 ${error
            ? "border-red-400 focus:border-red-500 bg-red-50/50"
            : "border-slate-200 focus:border-teal-600 focus:bg-white focus:shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          }`}
      />
      {error && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{error}</span>}
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
