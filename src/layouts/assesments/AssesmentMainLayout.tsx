import React from "react";
import { Outlet } from "react-router-dom";

const AssesmentMainLayout: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Outlet />
  </div>
);

export default AssesmentMainLayout;
