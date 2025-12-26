import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
  label?: string; // Added label prop for flexibility
  type?: "button" | "submit" | "reset";
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = "Back",
  type = "button",
  className = "",
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default if it's inside a form and not meant to submit
    if (type === "button") e.preventDefault();

    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      aria-label="Go back to previous page"
      className={`
        group inline-flex items-center gap-2 px-4 py-2 
        text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500
        bg-transparent 
        rounded-xl border border-transparent
        hover:bg-slate-100 hover:text-slate-800 
        active:scale-95 
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${className}
      `}
    >
      <ArrowLeft
        size={16}
        strokeWidth={2.5}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;