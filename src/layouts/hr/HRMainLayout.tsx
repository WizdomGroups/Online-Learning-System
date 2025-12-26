import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useEffect } from "react";
import useSessionStorage from "../../lib/hooks/useLocalStorageUserData";

const HRMainLayout = () => {
  const { jwtToken } = useSessionStorage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!jwtToken) {
      navigate("/auth/login");
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HRMainLayout;
