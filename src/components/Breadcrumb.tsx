import React from "react";

interface BreadcrumbProps {
  path: string;
  subPath?: string;
  subSubPath?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  path,
  subPath,
  subSubPath,
}) => {
  return (
    <div className="bg-[#ECEFF6] text-sm text-gray-700 py-4 px-2 sm:px-4 md:px-6 lg:px-8">
      <span className="text-[#1F2937] font-medium">{path}</span>
      {subPath && (
        <>
          <span className="mx-2">/</span>
          <span className="text-[#1F2937] font-medium">{subPath}</span>
        </>
      )}
      {subSubPath && (
        <>
          <span className="mx-2">/</span>
          <span className="text-[#1F2937] font-medium">{subSubPath}</span>
        </>
      )}
    </div>
  );
};

export default Breadcrumb;
