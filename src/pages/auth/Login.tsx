import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/TextField";
import PasswordField from "../../components/PasswordField";
import { loginValidationSchema } from "../../lib/ValidationsSchema";
import { LoginApiApiFunction } from "../../lib/network/authApis";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import ErrorModal from "../../components/ErrorModal";

interface FormErrorType {
  [key: string]: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrorType>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({ email: "", password: "" });
    setError("");

    try {
      dispatch(startLoading());
      await loginValidationSchema.validate(formData, { abortEarly: false });
      setFormErrors({});

      const response = await LoginApiApiFunction({
        email: formData.email,
        password: formData.password,
      });

      console.log("response-->", response);

      if (response.status === 200) {
        sessionStorage.setItem(
          "userData",
          JSON.stringify(response.data?.content)
        );
        sessionStorage.setItem(
          "token",
          JSON.stringify(response.data?.content?.token)
        );

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

        const role = response.data?.content?.user?.role?.id;
        const workStatus = response.data?.content?.user?.workStatus;

        if (!role) throw new Error("Invalid credentials. Please try again.");
        if (workStatus !== "Active")
          throw new Error("Access denied. Please contact the HR.");

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
            throw new Error("Unknown user role");
        }
      }
    } catch (error: any) {
      if (error.name === "ValidationError") {
        const validationErrors: any = {};
        error.inner.forEach((err: any) => {
          if (err.path) validationErrors[err.path] = err.message;
        });
        setFormErrors(validationErrors);
      } else {
        const backendMessage =
          error.response.data.message || error?.message || "An error occurred.";
        setError(backendMessage);
        // setIsErrorModalOpen(true);
      }
    } finally {
      dispatch(stopLoading());
    }
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
          <h2 className="text-2xl font-bold">Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
            {formErrors.password && (
              <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="rounded border-input"
                disabled={isLoading}
              />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => navigate("/auth/forgot-password")}
              className="text-sm text-primary-500 hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md bg-primary-hover text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        title={error}
        onCancel={() => setIsErrorModalOpen(false)}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </div>
  );
};

export default Login;
