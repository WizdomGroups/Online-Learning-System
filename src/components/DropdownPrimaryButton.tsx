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
        className={`flex items-center justify-between gap-2 bg-primary text-white font-semibold px-6 py-1 rounded hover:bg-primary-hover transition-all duration-200 min-w-[150px] ${buttonClassName}`}
        onClick={handleButtonClick}
        aria-haspopup={options.length > 0 ? "menu" : undefined}
        aria-expanded={options.length > 0 ? isOpen : undefined}
      >
        {text}
        {options.length > 0 && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        )}
      </button>

      {/* Dropdown List */}
      {options.length > 0 && (
        <div
          className={`absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-md transition-all duration-200 z-10 ${
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          } group-hover:visible group-hover:opacity-100`}
          role="menu"
        >
          {options.map((option, index) => (
            <button
              key={index}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
