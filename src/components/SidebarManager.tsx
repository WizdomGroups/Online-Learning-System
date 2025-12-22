import { Home, Book, BarChart, Award, FileText, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const SidebarManager = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-white"
        : "text-[#A6A6A6] hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-1.5 bg-gray-900 text-white rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay removed */}

      <aside
        className={`fixed top-12 lg:top-0 lg:static w-64 flex flex-col bg-gray-900 text-white h-[calc(100vh-3rem)] lg:h-screen lg:min-h-screen transform transition-transform duration-300 ease-in-out z-30 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-3 sm:p-4 border-b border-gray-700">
          <div className="flex justify-center items-center place-items-center">
            <img
              src="/images/company_logo.png"
              className="rounded block p-4 sm:p-5"
              alt="Company Logo"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="mt-2">
            <li>
              <NavLink
                to="/dashboard"
                className={linkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Dashboard</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/documents"
                className={linkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Document</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/modules"
                className={linkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Book size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Module</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/assessments"
                className={linkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Assessment</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/certifications"
                className={linkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Award size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Certification</span>
              </NavLink>
            </li>

            {/* <li>
              <NavLink
                to="/feedbacks"
                className={linkClasses}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText size={18} className="sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Feedbacks</span>
              </NavLink>
            </li> */}
          </ul>
        </nav>

        {/* Powered By Section */}
        <div className="p-4 border-t border-gray-700 mt-auto">
          <p className="text-center text-sm text-gray-400">
            Powered By{" "}
            <span className="font-semibold text-primary">Qreams</span>
          </p>
        </div>
      </aside>
    </>
  );
};

export default SidebarManager;
