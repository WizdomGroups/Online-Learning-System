import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../lib/hooks/useLocalStorageUserData";

const Navbar = () => {
  const {
    user,
    isAdmin,
    isSuperAdmin,
    isHR,
    isTrainer,
    employeeId,
    isManager,
  } = useLocalStorage();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-40">
      <div className="lg:ml-64"></div>

      <div className="flex items-center gap-4 relative">
        <div className="relative group">
          <button className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200 p-2 rounded-full shadow-sm">
            <Bell
              size={20}
              className="text-gray-700 group-hover:text-primary transition-colors duration-200"
            />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </div>

        <div
          className="relative cursor-pointer hover:ring-1 hover:ring-primary transition duration-200 px-2 py-1"
          ref={dropdownRef}
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          
          <div className="flex items-center gap-2">
            <img
              src="/images/default-profile-image.webp"
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover"
            />

            <div>
              <p className="text-xs">{user?.firstName}</p>
              <p className="text-xs">{user?.role?.name}</p>
            </div>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-40 z-10 py-2 text-xs animate-in fade-in-0 zoom-in-95 duration-200">
              <button
                onClick={() => {
                  if (isSuperAdmin) {
                    navigate("/super-admin/reset-password");
                  } else if (isAdmin) {
                    navigate("/admin/reset-password");
                  } else if (isManager) {
                    navigate("/manager/reset-password");
                  } else if (isHR) {
                    navigate("/hr/reset-password");
                  } else if (isTrainer) {
                    navigate("/trainer/reset-password");
                  } else if (employeeId) {
                    navigate("/employee/reset-password");
                  } else {
                    navigate("/employee/reset-password");
                  }
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="font-medium">Reset Password</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={() => navigate("/auth/login")}
                className="w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
