import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { useEffect } from "react";

const MainLayout = () => {
  const { user } = useLocalStorageUserData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [location.pathname]); // runs on every route/path change

  return (
    <div className="h-screen grid grid-cols-[w-56] lg:grid-cols-[16rem] grid-rows-[auto_1fr] overflow-hidden">
      {/* Sidebar */}
      <div className="row-span-2 bg-white border-r">
        <EmployeeSidebar />
      </div>

      {/* Navbar */}
      <div className="col-start-2">
        <Navbar />
      </div>

      {/* Main Content with scroll */}
      <main className="col-start-2 overflow-y-auto bg-[#F5F7FA]">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
