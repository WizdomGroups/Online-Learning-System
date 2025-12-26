import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  label: string;
  path: string;
}

interface DropdownPrimaryButtonProps {
  text: string;
  options?: DropdownOption[];
  className?: string;
  onClick?: () => void;
  buttonClassName?: string;
}

const DropdownPrimaryButton: React.FC<DropdownPrimaryButtonProps> = ({
  text,
  options = [],
  className = "",
  onClick,
  buttonClassName = "",
}) => {
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (path?: string) => {
    if (path) {
      navigate(path);
      setIsOpen(false);
    } else if (onClick) {
      onClick();
    }
  };

  const handleButtonClick = () => {
    if (options.length > 0) {
      setIsOpen((prev) => !prev);
    } else {
      handleClick();
    }
  };

  React.useEffect(() => {
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative group inline-block ${className}`}>
      {/* Main Button */}
      <button
        className={`flex items-center justify-between gap-3 bg-[#084c61] text-white px-6 py-3 rounded-xl border border-[#084c61] shadow-[0_4px_10px_rgba(8,76,97,0.2)] hover:bg-[#063949] hover:shadow-[0_6px_20px_rgba(8,76,97,0.25)] hover:-translate-y-0.5 transition-all duration-300 text-[11px] font-bold uppercase tracking-[0.15em] min-w-[150px] ${buttonClassName}`}
        onClick={handleButtonClick}
        aria-haspopup={options.length > 0 ? "menu" : undefined}
        aria-expanded={options.length > 0 ? isOpen : undefined}
      >
        {text}
        {options.length > 0 && (
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        )}
      </button>

      {/* Dropdown List */}
      {options.length > 0 && (
        <div
          className={`absolute left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl transition-all duration-200 z-50 overflow-hidden ${isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
            }`}
          role="menu"
        >
          {options.map((option, index) => (
            <button
              key={index}
              className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#084c61] transition-colors border-b border-slate-50 last:border-0"
              onClick={() => handleClick(option.path)}
              role="menuitem"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownPrimaryButton;
