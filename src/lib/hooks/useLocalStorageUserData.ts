import { useMemo } from "react";

export const getAuthToken = (): string | null => {
  const token = sessionStorage.getItem("token");
  return token ? JSON.parse(token) : null;
};

const LocalStorageStorageUserData = () => {
  const userData = useMemo(() => {
    try {
      const data = sessionStorage.getItem("userData");

      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to parse userData from sessionStorage:", error);

      return null;
    }
  }, []);
  return {
    user: userData?.user ?? null,
    jwtToken: userData?.token ?? null,
    role: userData?.user?.role ?? null,
    employeeId: userData?.user.employeeId ?? null,
    isAdmin: userData?.user?.role.id === 1,
    isSuperAdmin: userData?.user?.role.id === 8,
    isHR: userData?.user?.role.id === 2,
    isTrainer: userData?.user?.role.id === 7,
    isManager: userData?.user?.role.id === 3,
    tenentId: userData?.user?.tenentId?.id ?? null,
  };
};

export default LocalStorageStorageUserData;
