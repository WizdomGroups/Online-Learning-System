import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div
      className={`h-[50dvh] w-full flex justify-center items-center text-primary ${
        className || ""
      }`}
    >
      <AlertCircle className="text-primary h-5 w-5" />
      <p className="ml-2">{message}</p>
    </div>
  );
};

export default ErrorMessage;
