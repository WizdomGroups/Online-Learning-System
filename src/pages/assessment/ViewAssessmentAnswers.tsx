import React, { useEffect } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import { useSearchParams } from "react-router-dom";
import { fetchAssessmentAnswersByIdApiFunction } from "../../lib/network/assessmentApis";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const ViewAssessmentAnswers: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const answerGroupId = searchParams.get("answerGroupId");

  useEffect(() => {
    if (answerGroupId) {
      dispatch(fetchAssessmentAnswersByIdApiFunction({ answerGroupId }));
    }
  }, [answerGroupId, dispatch]);

  const { data, loading, error } = useSelector(
    (state: RootState) => state.assessmentAnswerById
  );

  // Improved Error Display
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Optional: Loading state (uncomment if you want to show a loading indicator)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-700">
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading assessment answers...</span>
        </div>
      </div>
    );
  }

  const assessmentQuestions = Array.isArray(data?.content?.result)
    ? data.content.result
    : [];

  const getOptionLabel = (index: number) => ["A", "B", "C", "D", "E"][index];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div>
          <Breadcrumb
            path="Assessment"
            subPath="Answers"
            subSubPath="View-answers-details"
          />

          <div className=" flex items-center gap-3  py-6 px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Assessment Answers
              </h1>
              <p className="text-sm text-gray-500">
                Detailed view of submitted answers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Questions & Answers Section Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-lg">
              Questions & Answers
            </h2>
            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {assessmentQuestions.length} Questions
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {assessmentQuestions?.map(
            (
              question: {
                id: number;
                questionText: string;
                option1: string;
                option2: string;
                option3: string;
                option4: string;
                option5: string;
                correctAnswer: number;
                userAnswer: number;
              },
              index: number
            ) => (
              <div
                key={question.id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
              >
                {/* Question Header with Status Badge */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Question Number Circle */}
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-base font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-gray-900 font-medium text-lg flex-1">
                        {question.questionText}
                      </p>
                      {/* Status Badge (Correct/Incorrect/Not Attempted) */}
                      {question.userAnswer && question.userAnswer > 0 ? (
                        question.userAnswer === question.correctAnswer ? (
                          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium whitespace-nowrap">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Correct
                          </span>
                        ) : (
                          <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium whitespace-nowrap">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Incorrect
                          </span>
                        )
                      ) : (
                        <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium whitespace-nowrap">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Not Attempted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-3 pl-12">
                  {" "}
                  {/* Adjusted padding-left for alignment */}
                  {[1, 2, 3, 4, 5].map((optionNum) => {
                    const optionValue = question[`option${optionNum}`];
                    const isCorrect = question.correctAnswer === optionNum;
                    const isUserAnswer = question.userAnswer === optionNum;

                    if (!optionValue) return null; // Only render if option exists

                    return (
                      <div
                        key={optionNum}
                        className={`p-4 rounded-lg border text-base ${
                          // Increased padding and font size
                          isCorrect
                            ? "bg-green-50 border-green-300 text-green-800"
                            : isUserAnswer && !isCorrect
                            ? "bg-red-50 border-red-300 text-red-800"
                            : "bg-gray-50 border-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                                // Slightly larger option circle
                                isCorrect
                                  ? "bg-green-200 text-green-800"
                                  : isUserAnswer && !isCorrect
                                  ? "bg-red-200 text-red-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {getOptionLabel(optionNum - 1)}
                            </span>
                            <span className="flex-1">{optionValue}</span>{" "}
                            {/* Added flex-1 to option text */}
                          </div>
                          {isCorrect && (
                            <span className="text-sm font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="text-sm font-semibold text-red-700 bg-red-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                              ✗ Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAssessmentAnswers;
