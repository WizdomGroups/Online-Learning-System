import React from "react";

interface ButtonPrimaryProps {
  text?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  text,
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  isLoading = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative group overflow-hidden
        inline-flex items-center justify-center gap-2
        px-6 py-3
        text-[11px] font-bold uppercase tracking-[0.15em] text-white
        bg-[#084c61] rounded-xl
        /* Professional Depth */
        shadow-[0_4px_10px_rgba(8,76,97,0.2)]
        border border-[#084c61]
        
        /* Animation & Interaction */
        transition-all duration-300 ease-out
        hover:bg-[#063949] hover:shadow-[0_6px_20px_rgba(8,76,97,0.25)] hover:-translate-y-0.5
        active:translate-y-0 active:scale-95
        
        /* Accessibility */
        focus:outline-none focus:ring-2 focus:ring-[#084c61]/30 focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
        
        ${className}
      `}
    >
      {/* Subtle Glint Effect */}
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-15deg)_translateX(-100%)] group-hover:duration-700 group-hover:[transform:skew(-15deg)_translateX(100%)]">
        <div className="relative h-full w-10 bg-white/10" />
      </div>

      {isLoading ? (
        <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        children ?? text
      )}
    </button>
  );
};

export default ButtonPrimary;