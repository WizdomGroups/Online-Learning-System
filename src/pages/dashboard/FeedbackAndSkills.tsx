import React from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import NotificationCard from "../../components/NotificationCard";

const FeedbackAndSkills: React.FC = () => {
  const feedbackItems = [
    {
      title:
        'Certificate Feedbacks – Kevin comments on your lecture "What is UX" in "2021 UI/UX Design with Figma"',
      time: "Just now",
    },
    {
      title:
        'Reporters Skills – John gave a 5 star rating on your course "2021 UI/UX Design with Figma"',
      time: "5 mins ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb path="Feedbacks and Skills" subPath="View All" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button with title */}
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <h1 className="text-xl font-semibold text-gray-800">
            Feedbacks and Skills
          </h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Insights and updates on skill development and feedback.
        </p>

        <main className="bg-white p-6 rounded-lg shadow-sm">
          <NotificationCard 
            heading="Recent Feedback"
            items={feedbackItems} 
          />
        </main>
      </div>
    </div>
  );
};

export default FeedbackAndSkills;
