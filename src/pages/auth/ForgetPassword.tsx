import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import {
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
} from "../../lib/ValidationsSchema";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import ErrorModal from "../../components/ErrorModal";
import {
  ForgotPasswordApiFunction,
  ResetPasswordApiFunction,
} from "../../lib/network/authApis";
import { ValidationError } from "yup";
import SuccessModal from "../../components/SuccessModel";

interface FormErrorType {
  [key: string]: string;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrorType>({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    try {
      dispatch(startLoading());

      if (step === "email") {
        await forgotPasswordValidationSchema.validate(
          { email: formData.email },
          { abortEarly: false }
        );

        // API call: Send OTP
        const forgotResponse = await ForgotPasswordApiFunction({
          email: formData.email,
        });
        console.log("Forgot Password API Response:", forgotResponse);
        if (forgotResponse?.data?.otp) {
          console.log("OTP:", forgotResponse.data.otp);
        }
        setStep("reset");
      } else {
        await resetPasswordValidationSchema.validate(
          {
            otp: formData.otp,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          },
          { abortEarly: false }
        );

        // API call: Reset password with OTP and new password
        const resetResponse = await ResetPasswordApiFunction({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        });
        console.log("Reset Password API Response:", resetResponse);

        setSuccessMessage("Password reset successful. You can now log in.");
        setIsSuccessModalOpen(true);
      }
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const validationErrors: FormErrorType = {};
        err.inner.forEach((e: any) => {
          if (e.path) validationErrors[e.path] = e.message;
        });
        setFormErrors(validationErrors);
      } else {
        setError(
          err?.response?.data?.message || err.message || "Something went wrong."
        );
        setIsErrorModalOpen(true);
      }
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <img
            src="/images/company_logo.jpeg"
            alt="Logo"
            className="w-40 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold">
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "email"
              ? "Enter your email address to receive an OTP."
              : "Enter the OTP and your new password below."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={step === "reset"}
            />
            {formErrors.email && (
              <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
            )}
          </div>

          {step === "reset" && (
            <>
              <div>
                <Input
                  label="OTP"
                  name="otp"
                  placeholder="Enter the OTP"
                  value={formData.otp}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.otp && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.otp}</p>
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

              <div>
                <PasswordField
                  label="Confirm Password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-primary-hover text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === "email" ? "Send OTP" : "Reset Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-sm text-primary-500 hover:underline focus:outline-none justify-items-end"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        title={error}
        onCancel={() => setIsErrorModalOpen(false)}
        onClose={() => setIsErrorModalOpen(false)}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="Success"
        subtitle={successMessage}
        onConfirm={handleSuccessModalClose}
        onClose={handleSuccessModalClose}
      />
    </div>
  );
};

export default ForgotPassword;
