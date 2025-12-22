import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ResultCardProps {
  question: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({
  question,
  correctAnswer,
  isCorrect,
}) => {
  return (
    <div className="flex items-start gap-3 p-4 border-b-2 border-[#F4F4F4] last:border-b-0">
      {isCorrect ? (
        <CheckCircle className="text-green-500 mt-1" />
      ) : (
        <XCircle className="text-primary mt-1" />
      )}
      <div>
        <p className="font-medium text-gray-800">{question}</p>
        <p className="text-sm text-gray-600">
          <span className="text-gray-500">Correct answer:</span>{" "}
          <span className="text-blue-600 font-medium">{correctAnswer}</span>
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
