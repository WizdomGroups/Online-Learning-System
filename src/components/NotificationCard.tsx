import React from "react";
import { Plus, ChevronRight, Bell } from "lucide-react";

interface NotificationItem {
  title: string;
  time: string;
}

interface NotificationCardProps {
  heading: string;
  items: NotificationItem[];
  showAddButton?: boolean;
  showViewAllButton?: boolean;
  onAddClick?: () => void;
  onViewAllClick?: () => void;
  className?: string;
}

const NotificationCard = ({
  heading,
  items,
  showAddButton = false,
  showViewAllButton = false,
  onAddClick,
  onViewAllClick,
  className = "",
}: NotificationCardProps) => {
  return (
    <div
      className={`relative p-5 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50 border border-slate-200 shadow-md overflow-hidden ${className}`}
    >
      {/* Static background bubbles */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-100/30 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-xl shadow-inner">
            <Bell size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{heading}</h2>
            <p className="text-xs text-slate-500">{items.length} notifications</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showAddButton && (
            <button
              onClick={onAddClick}
              className="p-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-md"
            >
              <Plus size={16} />
            </button>
          )}
          {showViewAllButton && (
            <button
              onClick={onViewAllClick}
              className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-all duration-300 shadow-md"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm"
          >
            <p className="text-sm text-slate-700">{item.title}</p>
            <p className="text-xs text-slate-400 mt-1">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCard;
