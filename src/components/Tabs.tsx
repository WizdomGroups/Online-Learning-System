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

const Tabs: React.FC<TabsProps> = ({ tabs, selectedTab, onChange }) => {
  return (
    <div className="w-full mt-5">
      <div className="border-b-2 border-gray-200 overflow-x-auto no-scrollbar">
        <div className="flex flex-nowrap gap-4 sm:gap-6 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "text-sm pb-2 font-medium transition-all -mb-[2px] cursor-pointer hover:text-primary-hover whitespace-nowrap",
              selectedTab === tab.value
                ? "text-primary border-b-3 border-primary "
                : "text-gray-500 border-b-3 border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
