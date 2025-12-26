import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/wizdom.png";
import { LoginApiApiFunction } from "../../lib/network/authApis";
import ErrorModal from "../../components/ErrorModal";
import SuccessModal from "../../components/SuccessModel";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Login successful!");

  useEffect(() => {
    setMounted(true);

    // Check for remembered credentials
    const rememberedData = localStorage.getItem("rememberedCredentials");
    if (rememberedData) {
      const { email, password } = JSON.parse(rememberedData);
      setFormData((prev) => ({
        ...prev,
        email,
        password,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await LoginApiApiFunction({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", response.data);

      if (response.status === 200) {
        const content = response.data?.content;

        if (content && content.token && content.user) {
          // Save authentication data
          sessionStorage.setItem("userData", JSON.stringify(content));
          sessionStorage.setItem("token", JSON.stringify(content.token));

          // Handle remember me
          if (formData.rememberMe) {
            localStorage.setItem(
              "rememberedCredentials",
              JSON.stringify({
                email: formData.email,
                password: formData.password,
              })
            );
          } else {
            localStorage.removeItem("rememberedCredentials");
          }

          // Check work status
          const workStatus = content.user?.workStatus;
          if (workStatus !== "Active") {
            setError("Access denied. Please contact the HR.");
            return;
          }

          // Show success modal
          const userName = content.user?.firstName || "User";
          setSuccessMessage(`Welcome back, ${userName}!`);
          setShowSuccess(true);

          // Navigate based on role after delay
          setTimeout(() => {
            const role = content.user?.role?.id;

            switch (Number(role)) {
              case 1:
                navigate("/admin/dashboard");
                break;
              case 2:
                navigate("/hr/dashboard");
                break;
              case 3:
                navigate("/manager/dashboard");
                break;
              case 4:
                navigate("/employee/dashboard");
                break;
              case 7:
                navigate("/trainer/dashboard");
                break;
              case 8:
                navigate("/super-admin/dashboard");
                break;
              default:
                navigate("/");
            }
          }, 1500);
        } else {
          setError("Invalid response from server. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans antialiased text-slate-900">

      {/* ================= LEFT FIXED IMAGE (60%) ================= */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-[60%] overflow-hidden bg-[#022c22]">
        <img
          src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=2000"
          alt="Learning Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/80 via-transparent to-teal-950" />

        <div className="relative z-10 w-full flex flex-col justify-between p-20">
          <div
            className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
          >
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-teal-400" />
              <span className="text-xl font-light tracking-[0.4em] text-white uppercase">
                Wizdom Client Connect
              </span>
            </div>
          </div>

          <div
            className={`max-w-xl transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <h1 className="text-6xl font-extralight text-white leading-[1.1] mb-8">
              Precision in every <br />
              <span className="font-semibold text-teal-400">Interaction.</span>
            </h1>
            <p className="text-teal-50/60 text-xl font-light leading-relaxed max-w-md">
              The definitive platform for professional client lifecycle
              management.
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT LOGIN FORM (40%) ================= */}
      <div className="relative w-full lg:w-[40%] lg:ml-[60%] min-h-screen overflow-y-auto bg-white flex items-center justify-center p-8 lg:p-16">
        <div
          className={`w-full max-w-sm transition-all duration-1000 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
        >

          {/* BIG LOGO + WELCOME */}
          <div className="mb-12 flex justify-center">
            <img
              src={Logo}
              alt="Wizdom Logo"
              className="w-full max-w-[200px] h-auto object-contain"
            />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
                Work Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@address.com"
                className="w-full py-3 bg-transparent border-b border-slate-200 focus:outline-none focus:border-teal-600 placeholder:text-slate-300 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full py-3 bg-transparent border-b border-slate-200 focus:outline-none focus:border-teal-600 placeholder:text-slate-300 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-teal-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 text-xs text-slate-500">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="accent-teal-600"
                />
                Keep me active
              </label>
              <button
                type="button"
                onClick={() => navigate("/auth/forgot-password")}
                className="text-xs font-medium text-teal-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-teal-900 text-white font-bold tracking-[0.2em] uppercase text-[10px]
              hover:bg-teal-800 active:scale-[0.98] transition-all flex justify-center items-center shadow-xl"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Authenticate"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">
              © 2025 Wizdom Groups
            </p>
          </div>
        </div>
      </div>

      {/* ERROR MODAL */}
      {error && (
        <ErrorModal
          isOpen={true}
          subtitle={error}
          title="Login Failed"
          onClose={() => setError("")}
        />
      )}

      {/* SUCCESS MODAL */}
      <SuccessModal
        isOpen={showSuccess}
        title={successMessage}
        subtitle="Redirecting to dashboard..."
        confirmText="Continue"
        onConfirm={() => {
          setShowSuccess(false);
          navigate("/");
        }}
        onClose={() => {
          setShowSuccess(false);
          navigate("/");
        }}
      />
    </div>
  );
};

export default Login;
