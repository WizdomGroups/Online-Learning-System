import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" strokeWidth={2.5} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;