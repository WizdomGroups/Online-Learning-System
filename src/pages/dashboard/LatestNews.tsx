import React from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import NotificationCard from "../../components/NotificationCard";

const LatestNews: React.FC = () => {
  const newsItems = [
    {
      title: "We've just launched a new course: 'Advanced UI/UX Design with Figma (2024)'.",
      time: "Just now",
    },
    {
      title: "Now you can share your earned certifications directly on LinkedIn with one click!",
      time: "5 mins ago",
    },
    {
      title: "Purchase your course '2021 ui/ux design with figma'",
      time: "6 mins ago",
    },
  ];

  return (
    <div>
      <Breadcrumb path="Latest News" subPath={`View All`} />

      <div className="p-2 sm:p-4 md:p-6 lg:p-8 -mt-8">
        
       <main className="mt-4">
  <div className="flex items-center gap-3 mb-1">
    <BackButton />
    <h1 className="text-xl font-semibold">Latest News</h1>
  </div>

  <span className="text-gray-500 text-sm mb-5 block">
    Latest news from your learning hub: updates, tips and more.
  </span>

  <NotificationCard 
    heading="Latest Updates"
    items={newsItems} 
  />
</main>

      </div>
    </div>
  );
};

export default LatestNews;
