import React from "react";

interface AssessmentQuestionCardProps {
  questionId: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5?: string;
  complexity: "easy" | "medium" | "hard";
  correctAnswer: number;
}

const AssessmentQuestionCard: React.FC<AssessmentQuestionCardProps> = ({
  questionId,
  questionText,
  option1,
  option2,
  option3,
  option4,
  option5,
  complexity,
  correctAnswer,
}) => {
  const options = [option1, option2, option3, option4, option5].filter(Boolean);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-800">
          Question {questionId}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium capitalize w-fit ${getComplexityColor(
            complexity
          )}`}
        >
          {complexity}
        </span>
      </div>

      <p className="text-gray-700 text-sm sm:text-base mb-6">{questionText}</p>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className={`border rounded-md px-3 py-3 flex items-start sm:items-center text-sm sm:text-base ${
              index + 1 === correctAnswer
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <span className="w-6 h-6 flex items-center justify-center rounded-full border mr-3 text-xs sm:text-sm">
              {String.fromCharCode(65 + index)}
            </span>
            <span className={index + 1 === correctAnswer ? "font-medium" : ""}>
              {option}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentQuestionCard;
