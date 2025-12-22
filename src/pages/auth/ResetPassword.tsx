import React, { useState } from "react";
import Input from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { ResetOLDPasswordApiFunction } from "../../lib/network/authApis";
import SuccessModal from "../../components/SuccessModel";
import BackButton from "../../components/BackButton";

// Yup validation schema
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  oldPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
});

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
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
          error?.response?.data?.message ||
            "Failed to reset password. Please try again."
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <BackButton />
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <p className="text-gray-600 mt-1">Update your password</p>
          </div>
        </div>

        {generalError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {formErrors.email && (
              <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <PasswordField
              label="Current Password"
              name="oldPassword"
              placeholder="Enter current password"
              value={formData.oldPassword}
              onChange={handleInputChange}
              required
            />
            {formErrors.oldPassword && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.oldPassword}
              </p>
            )}
          </div>

          <div>
            <PasswordField
              label="New Password"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
            />
            {formErrors.newPassword && (
              <p className="text-sm text-red-500 mt-1">
                {formErrors.newPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md bg-primary-hover mt-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-sm text-primary-500 hover:underline focus:outline-none"
            >
              Back to Sign In
            </button>
          </div>
        </form>

        <SuccessModal
          isOpen={isSuccessModalOpen}
          title="Password Reset Successful"
          subtitle="Your password has been updated. Please log in with your new password."
          onConfirm={handleSuccessConfirm}
          onClose={handleSuccessConfirm}
        />
      </div>
    </div>
  );
};

export default ResetPassword;
