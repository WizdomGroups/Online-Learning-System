import React from "react";
import { cn } from "../lib/utils";

type TabItem = {
  label: string;
  value: string;
};

type TabsProps = {
  tabs: TabItem[];
  selectedTab: string;
  onChange: (value: string) => void;
};

const TabsForCertification: React.FC<TabsProps> = ({ tabs, selectedTab, onChange }) => {
  return (
    <div className="w-full mt-6">
      <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-200/60">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out relative overflow-hidden",
              "hover:scale-[1.02] active:scale-[0.98]",
              selectedTab === tab.value
                ? "bg-white text-gray-900 shadow-sm border border-gray-200/80 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            )}
          >
            <span className="relative z-10">{tab.label}</span>
            {selectedTab === tab.value && (
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-amber-50 opacity-30" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsForCertification;