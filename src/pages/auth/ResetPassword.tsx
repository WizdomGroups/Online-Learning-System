import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";

import Input from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import { ResetOLDPasswordApiFunction } from "../../lib/network/authApis";
import SuccessModal from "../../components/SuccessModel";
import BackButton from "../../components/BackButton";

// Yup validation schema
const validationSchema = Yup.object({
  email: Yup.string().email("Please enter a valid email address").required("Email is required"),
  oldPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
});

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const brandTeal = "#084c61";
  const brandAccent = "#2dd4bf";

  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setGeneralError("");

    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setIsLoading(true);
      await ResetOLDPasswordApiFunction(formData);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err: any) => {
          if (err.path) errors[err.path] = err.message;
        });
        setFormErrors(errors);
      } else {
        setGeneralError(
          error?.response?.data?.message || "Authentication failed. Please check your credentials."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,76,97,0.08)] border border-slate-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="p-8 pb-4 relative">
            <div className="absolute left-8 top-10">
              <BackButton />
            </div>
            <div className="flex flex-col items-center pt-2">
              <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-4 shadow-sm">
                <ShieldCheck size={28} color={brandTeal} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Security Update</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Reset your credentials</p>
            </div>
          </div>

          <div className="px-10 pb-10">
            <AnimatePresence>
              {generalError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-semibold"
                >
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  {generalError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <div className="flex justify-between mb-2 px-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                </div>
                <div className="relative">
                    <Input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full !border-slate-100 focus:!border-[#084c61] !rounded-xl !bg-slate-50/50 !h-12 !px-4 transition-all ${formErrors.email ? 'border-rose-400' : ''}`}
                    />
                </div>
                {formErrors.email && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5 ml-1 uppercase">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Current Password</label>
                <PasswordField
                  name="oldPassword"
                  placeholder="••••••••"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  className="w-full !border-slate-100 focus:!border-[#084c61] !rounded-xl !bg-slate-50/50 !h-12 transition-all"
                />
                {formErrors.oldPassword && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5 ml-1 uppercase">{formErrors.oldPassword}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">New Password</label>
                <PasswordField
                  name="newPassword"
                  placeholder="At least 6 characters"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full !border-slate-100 focus:!border-[#084c61] !rounded-xl !bg-slate-50/50 !h-12 transition-all"
                />
                {formErrors.newPassword && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1.5 ml-1 uppercase">{formErrors.newPassword}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: brandTeal }}
                className="w-full py-4 px-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4 hover:shadow-[#084c6140]"
              >
                {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>CONFIRM CHANGE <ArrowRight size={16} /></>
                )}
              </motion.button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className="text-[11px] font-black text-slate-400 hover:text-[#084c61] transition-colors uppercase tracking-[0.15em]"
                >
                  Return to <span className="underline underline-offset-4 text-[#084c61]">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
      
      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="Password Secure"
        subtitle="Your password has been successfully updated. You may now log in with your new credentials."
        onConfirm={handleSuccessConfirm}
        onClose={handleSuccessConfirm}
      />
    </div>
  );
};

export default ResetPassword;