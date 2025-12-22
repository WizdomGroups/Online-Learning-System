import { Outlet } from "react-router-dom";

const ModuleLayout = () => {
  return (
    <div className="">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ModuleLayout;
