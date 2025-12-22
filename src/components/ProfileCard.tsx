import React from "react";
import { Mail, User, Hash, Briefcase, Building } from "lucide-react";

interface ProfileCardProps {
  name: string;
  email: string;
  avatarUrl: string;
  designation: string;
  department: string;
  idNumber: string;
  className?: string;
}

const ProfileCard = ({
  name,
  email,
  avatarUrl,
  designation,
  department,
  idNumber,
  className = "",
}: ProfileCardProps) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${className}`}
    >
      {/* Header with Avatar */}
      <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
          />
          {/* Online Status Indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
            <Mail size={14} className="flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Hash size={12} className="flex-shrink-0" />
            <span>Employee ID: {idNumber}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Designation */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Briefcase size={16} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Designation
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 ml-10">
            {designation}
          </p>
        </div>

        {/* Department */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Building size={16} className="text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Department
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 ml-10">
            {department}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;