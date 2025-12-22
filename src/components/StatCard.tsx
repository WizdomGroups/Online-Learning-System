import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  className?: string;
  animated?: boolean;
  showTrend?: boolean;
  targetValue?: number;
  unit?: string;
  subtitle?: string;
  change?: string;
  description?: string;
  bgColor?: string;
  iconColor?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  className = "",
  animated = true,
  showTrend = false,
  targetValue,
  unit = "",
  subtitle,
  change,
  description,
  bgColor,
  iconColor,
}: StatCardProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(value);
      return;
    }

    const duration = 1500;
    const steps = 50;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setAnimatedValue(Math.floor(current));
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animated]);

  const progressPercentage = targetValue
    ? Math.min((value / targetValue) * 100, 100)
    : 75;

  return (
    <div
      className={`group relative bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {title}
              </h3>
              {showTrend && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-sky-100 rounded">
                  <TrendingUp size={10} className="text-sky-600" />
                  <span className="text-[10px] text-sky-600 font-medium">
                    Active
                  </span>
                </div>
              )}
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-gray-800 tabular-nums">
                {animatedValue.toLocaleString()}
              </p>
              {unit && (
                <span className="text-sm text-gray-500 font-medium">{unit}</span>
              )}
            </div>

            {(change || description) && (
              <p className="text-xs text-gray-500 mt-1">
                {change || description}
              </p>
            )}
          </div>

          {/* Icon */}
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ 
              background: bgColor || '#bae6fd',
            color: iconColor || '#ffffff'
            }}
          >
            <div className="scale-110">{icon}</div>
          </div>
        </div>

        {/* Progress Bar */}
        {targetValue && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Progress
              </span>
              <span className="text-xs font-semibold text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: "#0ea5e9", // sky-500
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0</span>
              <span>{targetValue.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Subtitle */}
        {subtitle && !targetValue && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        )}
      </div>

      {/* Hover Outline */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-sky-200 rounded-lg transition-colors duration-200 pointer-events-none" />
    </div>
  );
};

export default StatCard;
