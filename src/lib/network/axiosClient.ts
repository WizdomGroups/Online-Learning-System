// services/axiosClient.ts
import axios from "axios";
import { getAuthToken } from "../hooks/useLocalStorageUserData";
import { logout } from "../utils/logout";
import { BASE_URL, LMT_CONTEXT } from "../endPoints";

const axiosClient = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL || "", // For React apps
  baseURL: `${BASE_URL}/${LMT_CONTEXT}`, // Use dynamic base URL from endpoints
  // Do NOT set Content-Type here!
});

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      logout(); // Automatically logs the user out and redirects
    }

    console.log("error in axiosClient-->", error);

    // For blob responses, don't extract the message here as it needs special handling
    if (error?.config?.responseType === "blob") {
      return Promise.reject(error); // Pass through the original error
    }

    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    // Preserve original error (including response) while updating message
    if (error && typeof error === "object") {
      (error as any).message = errorMsg;
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
