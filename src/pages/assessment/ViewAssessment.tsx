import React, { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import QuestionCard from "../../components/QuestionCard";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import { useNavigate } from "react-router-dom";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";

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

const ViewAssessment: React.FC = () => {
  const { user, isAdmin, isTrainer } = useLocalStorageUserData();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div>
      <Breadcrumb path="Assessment" subPath="View Assessment" />
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <BackButton />
        <h1 className="text-xl font-semibold mb-1">View Assessment</h1>
        <h1 className="text-3xl font-semibold my-3">Questions</h1>
        <main className="mt-4">
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

          <div className="flex gap-4 mt-10">
            <ButtonSecondary text="Cancel" onClick={() => console.log("log")} />
            <ButtonPrimary
              text="View Result"
              onClick={() => {
                if (isAdmin) {
                  navigate("/admin/assessments/assessment-result");
                } else {
                  navigate("/trainer/assessments/assessment-result");
                }
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewAssessment;
