import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/wizdom.png";
import {
  ForgotPasswordApiFunction,
  ResetPasswordApiFunction,
} from "../../lib/network/authApis";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessModal from "../../components/SuccessModel";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (step === "email") {
        // Send OTP to email
        const forgotResponse = await ForgotPasswordApiFunction({
          email: formData.email,
        });
        console.log("Forgot Password API Response:", forgotResponse);

        if (forgotResponse?.data?.otp) {
          console.log("OTP:", forgotResponse.data.otp);
        }

        setStep("reset");
      } else {
        // Reset password with OTP
        const resetResponse = await ResetPasswordApiFunction({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        });
        console.log("Reset Password API Response:", resetResponse);

        setSuccessMessage("Password reset successful!");
        setShowSuccess(true);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/auth/login");
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
                Wizdom Learning Platform
              </span>
            </div>
          </div>

          <div
            className={`max-w-xl transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <h1 className="text-6xl font-extralight text-white leading-[1.1] mb-8">
              Complete your courses. <br />
            </h1>
            <p className="text-teal-50/60 text-xl font-light leading-relaxed max-w-md">
              Your dedicated platform for employee training and professional
              development courses.
            </p>
          </div>
        </div>
      </div>

      {/* ================= RIGHT FORM (40%) ================= */}
      <div className="relative w-full lg:w-[40%] lg:ml-[60%] min-h-screen overflow-y-auto bg-white flex items-center justify-center p-8 lg:p-16">
        <div
          className={`w-full max-w-sm transition-all duration-1000 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
        >

          {/* LOGO */}
          <div className="mb-12 flex justify-center">
            <img
              src={Logo}
              alt="Wizdom Logo"
              className="w-full max-w-[200px] h-auto object-contain"
            />
          </div>

          {/* TITLE */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {step === "email" ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className="text-sm text-slate-500">
              {step === "email"
                ? "Enter your email address to receive an OTP."
                : "Enter the OTP and your new password below."}
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@address.com"
                disabled={step === "reset"}
                className="w-full py-3 bg-transparent border-b border-slate-200 focus:outline-none focus:border-teal-600 placeholder:text-slate-300 transition-all disabled:opacity-50"
                required
              />
            </div>

            {step === "reset" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="Enter OTP"
                    className="w-full py-3 bg-transparent border-b border-slate-200 focus:outline-none focus:border-teal-600 placeholder:text-slate-300 transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full py-3 bg-transparent border-b border-slate-200 focus:outline-none focus:border-teal-600 placeholder:text-slate-300 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-teal-600"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-teal-900 text-white font-bold tracking-[0.2em] uppercase text-[10px]
              hover:bg-teal-800 active:scale-[0.98] transition-all flex justify-center items-center shadow-xl"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                step === "email" ? "Send OTP" : "Reset Password"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="text-xs font-medium text-teal-700 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
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
        <ErrorMessage
          message={error}
          title="Error"
          onClose={() => setError("")}
        />
      )}

      {/* SUCCESS MODAL */}
      <SuccessModal
        isOpen={showSuccess}
        title={successMessage}
        subtitle="You can now log in with your new password."
        confirmText="Go to Login"
        onConfirm={handleSuccessClose}
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default ForgotPassword;
