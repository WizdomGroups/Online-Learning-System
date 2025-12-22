import React from "react";

interface UserCardProps {
  image: string;
  name: string;
  department: string;
  role: string;
  id: string;
  isSelected: boolean;
  onToggle: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  image,
  name,
  department,
  role,
  id,
  isSelected,
  onToggle,
}) => {
  return (
    <div className="grid grid-cols-5 py-4 border-b border-gray-100 gap-4">
      {/* Left Side: Image + Info */}
      <div className="col-span-3 flex justify-between items-center gap-4 w-full">
        {/* Profile Image */}
        <div className="relative w-10 h-10">
          <img
            src={image}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <span className="truncate">{name}</span>
          <div className="text-xs text-gray-500 truncate">{id}</div>
        </div>
        <span className="truncate">{department}</span>
        <span className="truncate">{role}</span>
      </div>

      {/* Right Side: Checkbox */}
      <div className="col-span-2 flex justify-end items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
        />
      </div>
    </div>
  );
};

export default UserCard;
