import React from "react";

interface ButtonSecondaryProps {
  text?: string; // optional now
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  text,
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-gray-200 cursor-pointer text-gray-700 hover:text-gray-900 font-semibold
         px-3 py-1.5 sm:px-4 sm:py-2
         text-sm
         rounded-md hover:bg-gray-300
         transition-all duration-200 ease-in-out
         min-w-[80px] sm:min-w-[90px]
         border border-gray-300 hover:border-gray-400
         focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-1
         transform hover:scale-[1.02] hover:shadow-md
         ${disabled ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none" : ""}
        ${className}`}
    >
      {children ?? text}
    </button>
  );
};

export default ButtonSecondary;