import React from "react";
import { Outlet } from "react-router-dom";

const EmployeeCertificationLayout = () => {
  return (
    <div>
      {/* {status === "all" && <AllCertifications />}
      {status !== "all" && <CertificationsTransaction />} */}
      <Outlet />
    </div>
  );
};

export default EmployeeCertificationLayout;
