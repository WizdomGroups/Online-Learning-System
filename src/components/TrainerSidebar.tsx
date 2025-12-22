import {
  LayoutDashboard,
  NotebookPen,
  FolderKanban,
  ClipboardList,
  Medal,
  Menu,
  X,
  Award,
  LucideIcon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const TrainerSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationSections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [
        {
          title: "Dashboard",
          path: "/trainer/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "TRAINING CONTENT",
      items: [
        {
          title: "Documents",
          path: "/trainer/documents",
          icon: FolderKanban,
        },
        {
          title: "Modules",
          path: "/trainer/modules",
          icon: NotebookPen,
        },

        {
          title: "Trainings",
          path: "/trainer/trainings",
          icon: Medal,
        },
        {
          title: "Certifications",
          path: "/trainer/certifications",
          icon: Award,
        },
        {
          title: "Assessments",
          path: "/trainer/assessments",
          icon: ClipboardList,
        },
      ],
    },
  ];

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 rounded text-white ${
      isActive
        ? "bg-[var(--color-sidebar-active-bg)]"
        : "hover:bg-[var(--color-sidebar-hover-bg)]"
    }`;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-1.5 bg-[var(--color-sidebar-bg)] text-white rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed top-12 lg:top-0 lg:static w-64 flex flex-col bg-[var(--color-sidebar-bg)] text-white h-[calc(100vh-3rem)] lg:h-screen transform transition-transform duration-300 ease-in-out z-30 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-2 border-b border-[var(--color-sidebar-hover-bg)]">
          <div className="flex justify-center items-center w-full h-[60px] mx-auto">
            <img
              src="/images/company_logo.jpeg"
              alt="Company Logo"
              className="h-full object-contain cursor-pointer"
              onClick={() => navigate("/trainer/dashboard")}
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[var(--color-sidebar-hover-bg)] [&::-webkit-scrollbar-thumb]:bg-[var(--color-sidebar-active-bg)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[var(--color-sidebar-active-bg)]">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <div className="px-4 py-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase">
                  {section.title}
                </h2>
              </div>
              <ul
                className={`space-y-1 px-2 ${
                  sectionIndex === 0 ? "mt-2" : "mt-4"
                }`}
              >
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={linkClasses}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon
                        size={18}
                        className="sm:w-5 sm:h-5 text-white"
                      />
                      <span className="text-sm sm:text-base text-white">
                        {item.title}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
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

export default TrainerSidebar;
