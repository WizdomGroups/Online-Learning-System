import React from "react";

interface NoRecentActivityProps {
  subHeading: string;
}

const NoRecentActivity: React.FC<NoRecentActivityProps> = ({ subHeading }) => {
  return (
    <>
      <p className="mb-2 text-base text-[#666666]">{subHeading}</p>
      <div className="bg-white rounded-md shadow-sm text-center py-12 px-6">
        <img
          src="/images/no-recent-activity.svg"
          alt="No Activity"
          className="mx-auto mb-6 w-52"
        />
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          No Recent Activity Yet
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Your recent activities will show up here as you start learning and
          interacting with the platform. Explore our certification or jump into
          it if you’ve already started.
        </p>
      </div>
    </>
  );
};

export default NoRecentActivity;
