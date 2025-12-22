// utils/logout.ts
export const logout = () => {
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("token");

  window.location.href = "/auth/login";
};
