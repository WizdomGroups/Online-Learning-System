import React, { useState } from "react";

interface TooltipProps {
  text: string;
  maxLength?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Tooltip1: React.FC<TooltipProps> = ({ 
  text, 
  maxLength = 15, 
  position = 'top',
  delay = 300,
  disabled = false,
  className = "",
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const displayText = maxLength && text?.length > maxLength 
    ? `${text.slice(0, maxLength)}...` 
    : text;

  const shouldShowTooltip = !disabled && text && (maxLength ? text.length > maxLength : true);

  const handleMouseEnter = () => {
    if (!shouldShowTooltip) return;
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getTooltipPositionClasses = () => {
    const baseClasses = "absolute z-[9999] px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap max-w-xs";
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-full mt-2 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} right-full mr-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full ml-2 top-1/2 transform -translate-y-1/2`;
      default:
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
    }
  };

  const getArrowClasses = () => {
    const baseArrow = "absolute w-2 h-2 bg-gray-900 rotate-45";
    
    switch (position) {
      case 'top':
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseArrow} left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2`;
      case 'right':
        return `${baseArrow} right-full top-1/2 transform -translate-y-1/2 translate-x-1/2`;
      default:
        return `${baseArrow} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
    }
  };

  return (
    <div 
      className={`relative inline-block w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children ? (
        <div className="cursor-pointer">
          {children}
        </div>
      ) : (
        <span className="cursor-pointer truncate block select-none">
          {displayText}
        </span>
      )}
      
      {shouldShowTooltip && isVisible && (
        <div className={getTooltipPositionClasses()}>
          <div className="break-words">
            {text}
          </div>
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip1;