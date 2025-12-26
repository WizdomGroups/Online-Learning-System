import React from "react";

interface ButtonSecondaryProps {
  text?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3 
        text-[11px] font-bold uppercase tracking-[0.15em]
        text-slate-600 bg-slate-100
        border border-transparent
        rounded-xl
        
        /* Interactions */
        transition-all duration-300 ease-out
        hover:bg-slate-200 hover:text-slate-800 hover:-translate-y-0.5
        active:scale-95 active:translate-y-0
        
        /* Focus/Accessibility */
        focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        
        ${className}
      `}
    >
      {children ?? text}
    </button>
  );
};

export default ButtonSecondary;