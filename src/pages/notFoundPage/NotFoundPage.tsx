import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-3 bg-orange-100 rounded-full">
            <Construction className="w-16 h-16 text-orange-600" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Feature Coming Soon
        </h1>
        <p className="text-gray-600 mb-6">
          We're working hard to bring you this feature in an upcoming version.
          Thank you for your patience!
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Additional Info */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-700">
            This section is currently under development and will be available in
            a future update. Please check back later.
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>

      {/* Version Info */}
      <div className="mt-4 text-sm text-gray-500">Current Version: 2.0.0</div>
    </div>
  );
};

export default NotFoundPage;
