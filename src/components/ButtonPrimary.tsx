import React from "react";

interface PrimaryButtonProps {
  text?: string; // optional now
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

const ButtonPrimary: React.FC<PrimaryButtonProps> = ({
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
      className={`bg-primary cursor-pointer text-[#f4f6f8] hover:text-white font-semibold
         px-3 py-1.5 sm:px-4 sm:py-2
         text-sm
         rounded-md hover:bg-primary-hover
         transition-all duration-200 ease-in-out
         min-w-[80px] sm:min-w-[90px]
         border border-primary hover:border-primary-hover
         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
         transform hover:scale-[1.02] hover:shadow-md
         ${disabled ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none" : ""}
        ${className}`}
    >
      {children ?? text}
    </button>
  );
};

export default ButtonPrimary;