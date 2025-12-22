import React from "react";
import { Outlet } from "react-router-dom";
const FeedbackLayout: React.FC = () => {
  return (
    <div className="">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default FeedbackLayout;
