import React from "react";

interface Option {
  label: string;
  value: string;
}

interface QuestionCardProps {
  question: string;
  options: Option[];
  selected?: string;
  onSelect: (value: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  selected,
  onSelect,
}) => {
  return (
    <div className="bg-white p-4 rounded-md mb-6">
      <h4 className="text-md font-medium mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.value}
            className={`border rounded-md px-4 py-2 flex items-center cursor-pointer transition ${
              selected === option.value
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 bg-white"
            }`}
            onClick={() => onSelect(option.value)}
          >
            <input
              type="radio"
              name={question}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onSelect(option.value)}
              className="mr-3"
            />
            <label className="cursor-pointer">{option.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
