import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useEffect } from "react";
import useSessionStorage from "../../lib/hooks/useLocalStorageUserData";
import SidebarAdmin from "../../components/AdminSidebar";

const AdminMainLayout = () => {
  const { jwtToken } = useSessionStorage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!jwtToken) {
      navigate("/auth/login");
    }
  }, [location.pathname]);

  return (
    <div className="grid h-screen overflow-hidden grid-rows-[auto_1fr] grid-cols-1 md:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <div className="md:row-span-2 md:border-r md:border-gray-200">
        <SidebarAdmin />
      </div>

      {/* Navbar */}
      <div className="bg-white col-start-1 md:col-start-2">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="bg-[#F5F7FA] overflow-y-auto col-start-1 md:col-start-2">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminMainLayout;
