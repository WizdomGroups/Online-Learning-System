import React from "react";
import { Star } from "lucide-react";

const OverallExperienceRating: React.FC = () => {
  const ratingGroups: number = 4;
  const starsPerGroup: number = 5;

  return (
    <div className="flex justify-between gap-8 p-4  bg-gray-50">
      {[...Array(ratingGroups)].map((_, i) => (
        <div key={i} className="text-center">
          <p className="font-semibold text-gray-800 mb-2">Overall Experience</p>
          <div className="flex gap-1 justify-center">
            {[...Array(starsPerGroup)].map((_, j) => (
              <Star key={j} fill="#f59e0b" color="#f59e0b" size={20} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverallExperienceRating;
