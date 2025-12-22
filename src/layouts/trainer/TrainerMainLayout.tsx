import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { useEffect } from "react";
import TrainerSidebar from "../../components/TrainerSidebar";

const TrainerMainLayout = () => {
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
      <div className="md:row-span-2 md:border-r md:border-gray-200">
        <TrainerSidebar />
      </div>

      {/* Navbar */}
      <div className="bg-white col-start-1 md:col-start-2">
        <Navbar />
      </div>

      {/* Main Content with scroll */}
      <main className="bg-[#F5F7FA] overflow-y-auto col-start-1 md:col-start-2">
        <Outlet />
      </main>
    </div>
  );
};

export default TrainerMainLayout;
