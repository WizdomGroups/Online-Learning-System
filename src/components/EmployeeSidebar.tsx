import { Award, LayoutDashboard, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        to: "/employee/dashboard",
        icon: (
          <LayoutDashboard size={18} className="sm:w-5 sm:h-5 text-white" />
        ),
        label: "Dashboard",
      },
    ],
  },
  {
    title: "Certification",
    items: [
      {
        to: "/employee/certifications",
        icon: <Award size={18} className="sm:w-5 sm:h-5 text-white" />,
        label: "Certifications",
      },
    ],
  },
];

const EmployeeSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 rounded ${
      isActive
        ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-fg)]"
        : "text-[var(--color-sidebar-icon)] hover:bg-[var(--color-sidebar-hover-bg)] hover:text-[var(--color-sidebar-fg)]"
    }`;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-1.5 bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-fg)] rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-12 lg:top-0 lg:static w-64 flex flex-col bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-fg)] h-[calc(100vh-3rem)] lg:h-screen transform transition-transform duration-300 ease-in-out z-30 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-2 border-b border-[var(--color-sidebar-hover-bg)]">
          <div className="flex justify-center items-center w-full h-[60px] mx-auto">
            <img
              src="/images/logo.png"
              alt="Company Logo"
              className="h-full object-contain cursor-pointer"
              onClick={() => navigate("/employee/dashboard")}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[var(--color-sidebar-bg)] [&::-webkit-scrollbar-thumb]:bg-[var(--color-sidebar-hover-bg)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[var(--color-sidebar-active-bg)]">
          {navigationSections.map((section, index) => (
            <div key={section.title}>
              <div className="px-4 py-3">
                <h2 className="text-xs font-semibold text-[var(--color-sidebar-icon)] uppercase">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-1 px-2">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={linkClasses}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{item.icon}</span>
                      <span className="text-sm sm:text-base text-white">
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              {index < navigationSections.length - 1 && (
                <div className="mt-4" />
              )}
            </div>
          ))}
        </nav>

        {/* Powered By Section */}
        <div className="p-4 border-t border-[var(--color-sidebar-hover-bg)] mt-auto">
          <p className="text-center text-sm text-gray-400">
            Powered By <span className="font-semibold text-white">Qreams</span>
          </p>
        </div>
      </aside>
    </>
  );
};

export default EmployeeSidebar;
