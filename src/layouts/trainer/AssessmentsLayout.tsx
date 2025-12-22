import React from "react";
import { Outlet } from "react-router-dom";
const AssessmentsLayout = () => {
  return (
    <div className="">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AssessmentsLayout;
