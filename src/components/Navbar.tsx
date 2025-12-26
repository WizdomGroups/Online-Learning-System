import React, { useEffect, useRef, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Bell, Menu, X, ChevronDown, LayoutDashboard,
  FolderKanban, NotebookPen, ClipboardList,
  Medal, Award, LogOut, KeyRound, User
} from "lucide-react";
import useLocalStorage from "../lib/hooks/useLocalStorageUserData";
import Logo from "../assets/wizdom.png";

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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const getRolePrefix = () => {
    if (isSuperAdmin) return "/super-admin";
    if (isAdmin) return "/admin";
    if (isManager) return "/manager";
    if (isHR) return "/hr";
    if (isTrainer) return "/trainer";
    return "/employee";
  };

  const rolePrefix = getRolePrefix();
  const isEmployee = employeeId && !isAdmin && !isTrainer && !isHR && !isManager && !isSuperAdmin;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/auth/login");
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
      to={to}
      onClick={() => setShowMobileMenu(false)}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isActive
          ? "text-[#02a8b5] bg-[#02a8b5]/10 shadow-sm ring-1 ring-[#02a8b5]/20"
          : "text-slate-600 hover:text-[#02a8b5] hover:bg-slate-50"
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 md:px-10 flex justify-between items-center shadow-sm sticky top-0 z-50 h-20">

      {/* LEFT: Logo & Nav */}
      <div className="flex items-center gap-10">
        <div
          className="flex items-center cursor-pointer transition-transform hover:opacity-90"
          onClick={() => navigate(`${rolePrefix}/dashboard`)}
        >
          <img src={Logo} alt="Wizdom" className="h-9 w-auto object-contain" />
        </div>

        <div className="hidden lg:flex items-center gap-1">
          <NavItem to={`${rolePrefix}/dashboard`} icon={LayoutDashboard} label="Dashboard" />
          {!isEmployee && (
            <>
              <NavItem to={`${rolePrefix}/documents`} icon={FolderKanban} label="Documents" />
              <NavItem to={`${rolePrefix}/modules`} icon={NotebookPen} label="Modules" />
              <NavItem to={`${rolePrefix}/assessments`} icon={ClipboardList} label="Assessments" />
              <NavItem to={`${rolePrefix}/trainings`} icon={Medal} label="Trainings" />
              <NavItem to={`${rolePrefix}/certifications`} icon={Award} label="Certifications" />
            </>
          )}
          {isEmployee && (
            <NavItem to="/employee/certifications" icon={Award} label="Certifications" />
          )}
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#02a8b5] transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 p-1 pr-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            <div className="w-9 h-9 rounded-lg bg-[#02a8b5] flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.firstName?.[0] || <User size={18} />}
            </div>

            <div className="hidden md:block text-left">
              <h4 className="text-[13px] font-bold text-slate-800 leading-none">
                {user?.firstName || "User"}
              </h4>
              <span className="text-[10px] font-black text-[#02a8b5] uppercase tracking-wider">
                {user?.role?.name || "Member"}
              </span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 md:hidden">
                <p className="text-sm font-bold text-slate-900">{user?.firstName}</p>
                <p className="text-[10px] text-[#02a8b5] font-bold uppercase">{user?.role?.name}</p>
              </div>

              <button
                onClick={() => { navigate(`${rolePrefix}/reset-password`); setShowUserDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-[#02a8b5]/5 hover:text-[#02a8b5] transition-colors"
              >
                <KeyRound size={16} />
                <span>Reset Password</span>
              </button>

              <hr className="my-1 border-slate-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE NAV */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm top-20 z-40" onClick={() => setShowMobileMenu(false)} />
          <div className="lg:hidden absolute top-[calc(100%-1px)] left-0 right-0 bg-white border-b border-slate-200 shadow-2xl z-50 p-4 flex flex-col gap-1 animate-in slide-in-from-top-5 duration-300">
            <NavItem to={`${rolePrefix}/dashboard`} icon={LayoutDashboard} label="Dashboard" />
            {!isEmployee && (
              <>
                <NavItem to={`${rolePrefix}/documents`} icon={FolderKanban} label="Documents" />
                <NavItem to={`${rolePrefix}/modules`} icon={NotebookPen} label="Modules" />
                <NavItem to={`${rolePrefix}/assessments`} icon={ClipboardList} label="Assessments" />
                <NavItem to={`${rolePrefix}/trainings`} icon={Medal} label="Trainings" />
                <NavItem to={`${rolePrefix}/certifications`} icon={Award} label="Certifications" />
              </>
            )}
            {isEmployee && (
              <NavItem to="/employee/certifications" icon={Award} label="Certifications" />
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;