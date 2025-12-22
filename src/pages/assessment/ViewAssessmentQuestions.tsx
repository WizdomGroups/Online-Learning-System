import React, { useEffect } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import { useSearchParams } from "react-router-dom";
import { fetchAssessmentQuestionsByModuleIdOrGroupId } from "../../lib/network/assessmentApis";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import AssessmentQuestionCard from "../../components/AssessmentQuestionCard";

const ViewAssessmentQuestions: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const questionGroupId = searchParams.get("questionGroupId");
  const certificationId = searchParams.get("certificationId");

  useEffect(() => {
    console.log("ViewAssessmentQuestions - questionGroupId:", questionGroupId);
    console.log("ViewAssessmentQuestions - certificationId:", certificationId);
    
    if (questionGroupId) {
      console.log("Fetching questions by questionGroupId:", questionGroupId);
      dispatch(
        fetchAssessmentQuestionsByModuleIdOrGroupId({ questionGroupId })
      );
    } else if (certificationId) {
      console.log("Fetching questions by certificationId:", certificationId);
      dispatch(
        fetchAssessmentQuestionsByModuleIdOrGroupId({ certificationId })
      );
    }
  }, [questionGroupId, certificationId, dispatch]);

  const { data, loading, error } = useSelector(
    (state: RootState) => state.assessmentQuestions
  );

  console.log("ViewAssessmentQuestions - Redux state:", { data, loading, error });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const assessmentQuestions = data?.content?.data || [];
  console.log("ViewAssessmentQuestions - assessmentQuestions:", assessmentQuestions);

  return (
    <div>
      <Breadcrumb
        path="Assessment"
        subPath="Questions"
        subSubPath="View-questions-details"
      />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          {/* <h1 className="text-xl font-semibold mb-1">View Assessment</h1> */}
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            Questions
          </h1>
          {/* <h1 className="text-3xl font-semibold my-3">Module Questions</h1> */}
        </div>

        <main className="mt-4">
          {assessmentQuestions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-500 text-lg mb-2">No questions found</div>
              <div className="text-gray-400 text-sm">
                {questionGroupId 
                  ? `No questions found for questionGroupId: ${questionGroupId}`
                  : certificationId 
                    ? `No questions found for certificationId: ${certificationId}`
                    : "No identifier provided"
                }
              </div>
            </div>
          ) : (
            <div className="questions-list">
              <div className="mb-4 text-sm text-gray-600">
                Found {assessmentQuestions.length} question(s)
              </div>
              {assessmentQuestions.map((question, idx) => (
                <AssessmentQuestionCard
                  key={question.questionId || idx}
                  questionId={idx + 1} // Pass question number
                  questionText={question.questionText}
                  option1={question.option1}
                  option2={question.option2}
                  option3={question.option3}
                  option4={question.option4}
                  option5={question.option5}
                  complexity={question.complexity}
                  correctAnswer={question.correctAnswer}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ViewAssessmentQuestions;
