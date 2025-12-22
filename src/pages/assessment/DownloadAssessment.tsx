import React, { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import QuestionCard from "../../components/QuestionCard";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import ResultCard from "../../components/ResultCard";

const sampleQuestions = [
  {
    id: 1,
    question: "What is the maximum takeoff weight of an Airbus A380?",
    options: [
      { label: "500kg", value: "500" },
      { label: "5kg", value: "5" },
      { label: "120kg", value: "120" },
      { label: "1000kg", value: "1000" },
    ],
  },
  {
    id: 2,
    question: "What is the maximum takeoff weight of an Airbus A380?",
    options: [
      { label: "500kg", value: "500" },
      { label: "5kg", value: "5" },
      { label: "120kg", value: "120" },
      { label: "1000kg", value: "1000" },
    ],
  },
];

const resultData = [
  {
    id: 1,
    question: "What is the maximum takeoff weight of an Airbus A380?",
    correctAnswer: "500kg",
    isCorrect: true,
  },
  {
    id: 2,
    question: "How many engines does a Boeing 747 have?",
    correctAnswer: "4",
    isCorrect: false,
  },
  {
    id: 3,
    question: "How many pilots are in the cockpit of a commercial flight?",
    correctAnswer: "2",
    isCorrect: true,
  },
  {
    id: 4,
    question:
      "What is the minimum number of flight attendants required on a commercial flight?",
    correctAnswer: "1",
    isCorrect: false,
  },
];

const DownloadAssessment = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };
  return (
    <div>
      <Breadcrumb path="Assessment" subPath="Download Assessment" />
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <BackButton />
        <main className="mt-4">
          <h1 className="text-xl font-semibold mb-1">Download Assessment</h1>
          <h1 className="text-3xl font-semibold my-3">Questions</h1>

          <div className="questions-list">
            {sampleQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q.question}
                options={q.options}
                selected={answers[q.id]}
                onSelect={(val) => handleSelect(q.id, val)}
              />
            ))}
          </div>

          <h1 className="text-xl font-semibold mb-1">Result</h1>

          <div className=" bg-white rounded-md max-w-4xl mt-5">
            {resultData.map((result) => (
              <ResultCard
                key={result.id}
                question={result.question}
                correctAnswer={result.correctAnswer}
                isCorrect={result.isCorrect}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-10">
            <ButtonSecondary text="Cancel" onClick={() => console.log("log")} />
            <ButtonPrimary text="Download" onClick={() => console.log("log")} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DownloadAssessment;
