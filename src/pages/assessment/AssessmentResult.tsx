import React from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import ResultCard from "../../components/ResultCard";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useNavigate } from "react-router-dom";
import useLocalStorageData from "../../lib/hooks/useLocalStorageUserData";

const AssessmentResult = () => {
  const { isAdmin, isTrainer } = useLocalStorageData();
  const navigate = useNavigate();
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
  return (
    <div>
      <Breadcrumb path="Assessment" subPath="View Result" />
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <BackButton />
        <main className="mt-4">
          <h1 className="text-xl font-semibold mb-1">View Result</h1>
          <h1 className="text-3xl font-semibold my-3">Results</h1>
          <h1 className="text-xl font-semibold mb-1">Quiz Result</h1>

          <span className="text-gray-500 text-sm">
            Your answers have been reviewed by a trainer. You can view your
            results and the feedback provided
          </span>

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
            <ButtonPrimary
              text="Next"
              onClick={() => {
                if (isAdmin) {
                  navigate("/admin/assessments/download-assessment");
                } else {
                  navigate("/trainer/assessments/download-assessment");
                }
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssessmentResult;
