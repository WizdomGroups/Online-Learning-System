import React, { useEffect, useState, useRef } from "react";
import Breadcrumb from "../../../components/Breadcrumb";
import BackButton from "../../../components/BackButton";
import QuestionCard from "../../../components/QuestionCard";
import ButtonPrimary from "../../../components/ButtonPrimary";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../../lib/hooks/useAppDispatch";
import {
  fetchAssessmentQuestionsByModuleIdOrGroupId,
  submitUserAssessmentApiFunction,
} from "../../../lib/network/assessmentApis";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import ErrorModal from "../../../components/ErrorModal";
import {
  startLoading,
  stopLoading,
} from "../../../store/features/globalConstant/loadingSlice";
import useLocalStorageUserData from "../../../lib/hooks/useLocalStorageUserData";
import { fetchCertificationTransactionByIdApiFunction } from "../../../lib/network/certificationTransactionApis";
import SuccessModal from "../../../components/SuccessModel";
import WarningModal from "../../../components/WarningModel";

interface FormErrorType {
  [key: string]: string;
}

const ViewUserAssessment: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useLocalStorageUserData();
  const [searchParams] = useSearchParams();
  const rawQgid = searchParams.get("questionGroupId");
  const certificationIdFromQuery = searchParams.get("certificationId");
  const questionGroupId =
    rawQgid && rawQgid !== "null" && rawQgid !== "undefined" && rawQgid !== ""
      ? rawQgid
      : null;
  const certificationTransactionId = searchParams.get(
    "certificationTransactionId"
  );

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<FormErrorType>({});
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  const [showAutoSubmitWarning, setShowAutoSubmitWarning] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Track if auto-submit has already happened
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const timerActive = timeLeft !== null && timeLeft > 0;
  const hasSubmittedRef = useRef(false);
  // No longer needed for submission payload; backend doesn't require moduleId
  const [resolvedModuleId, setResolvedModuleId] = useState<number | null>(null);

  const handleSelect = (id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    if (questionGroupId) {
      dispatch(
        fetchAssessmentQuestionsByModuleIdOrGroupId({ questionGroupId })
      );
    } else if (certificationIdFromQuery) {
      dispatch(
        fetchAssessmentQuestionsByModuleIdOrGroupId({
          certificationId: certificationIdFromQuery,
        })
      );
    }
  }, [questionGroupId, certificationIdFromQuery, dispatch]);

  const { data, loading, error } = useSelector(
    (state: RootState) => state.assessmentQuestions
  );

  // Fetch certification transaction for assessmentTime
  const { data: certificationTransaction } = useSelector(
    (state: RootState) => state.certificationTransactionById
  );

  useEffect(() => {
    if (certificationTransactionId) {
      dispatch(
        fetchCertificationTransactionByIdApiFunction({
          certificateTransactionId: certificationTransactionId,
        })
      );
    }
  }, [dispatch, certificationTransactionId]);

  // Fallback: if no questionGroupId, fetch questions by certificationId from transaction
  useEffect(() => {
    if (!questionGroupId && !certificationIdFromQuery && certificationTransaction?.certificationId) {
      dispatch(
        fetchAssessmentQuestionsByModuleIdOrGroupId({
          certificationId: String(certificationTransaction.certificationId),
        })
      );
    }
  }, [
    questionGroupId,
    certificationIdFromQuery,
    certificationTransaction?.certificationId,
    dispatch,
  ]);

  // Set timer when assessmentTime is available
  useEffect(() => {
    if (
      certificationTransaction &&
      certificationTransaction.Certification &&
      certificationTransaction.Certification.assessmentTime
    ) {
      setTimeLeft(certificationTransaction.Certification.assessmentTime * 60); // seconds
    }
  }, [certificationTransaction]);

  // Resolve moduleId if available (not required for submit)
  useEffect(() => {
    const questions: any[] = (data as any)?.content?.data || [];
    const candidateFromQuestions = questions.find((q) => q?.moduleId)?.moduleId;
    const candidateFromTx = (certificationTransaction as any)?.moduleId;
    const candidates = [candidateFromQuestions, candidateFromTx];
    const found = candidates.find((v) => v !== undefined && v !== null);
    if (found !== undefined && found !== null) setResolvedModuleId(Number(found));
  }, [data, certificationTransaction]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0 && !autoSubmitted) {
      setAutoSubmitted(true);
      setShowTimeUpModal(true); // Show time up modal
      setShowAutoSubmitWarning(false); // Hide warning if showing
      return;
    }
    if (timeLeft > 0) {
      setAutoSubmitted(false); // reset if timer is reset
    }
    const timer = setInterval(() => setTimeLeft((t) => (t ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, autoSubmitted]);

  // Block browser navigation (refresh, close, etc.) while timer is running
  useEffect(() => {
    if (timerActive) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue =
          "You cannot leave the page while the assessment is running.";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [timerActive]);

  // Block tab switching using Page Visibility API
  useEffect(() => {
    if (!timerActive) return;
    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        setShowAutoSubmitWarning(true); // Show warning modal before auto-submit
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [timerActive]);

  // Detect exit from fullscreen and auto-submit
  useEffect(() => {
    if (!timerActive) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        setShowAutoSubmitWarning(true); // Show warning modal before auto-submit
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [timerActive]);

  // When showAutoSubmitWarning is true, auto-submit after a 10 second delay
  useEffect(() => {
    if (showAutoSubmitWarning) {
      const timeout = setTimeout(() => {
        handleSubmitAssessment(true);
        setShowAutoSubmitWarning(false);
      }, 10000); // 10 seconds delay
      return () => clearTimeout(timeout);
    }
  }, [showAutoSubmitWarning]);

  // Request fullscreen when timer starts
  useEffect(() => {
    if (timerActive) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    }
  }, [timerActive]);

  // Detect exit from fullscreen and auto-submit
  useEffect(() => {
    if (!timerActive) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        setShowAutoSubmitModal(true);
        handleSubmitAssessment(true); // auto-submit
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [timerActive]);

  // Exit fullscreen when timer completes (auto-submit)
  useEffect(() => {
    if (timeLeft === 0) {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    }
  }, [timeLeft]);

  // Auto-submit when time is up and showTimeUpModal is true
  useEffect(() => {
    if (showTimeUpModal) {
      handleSubmitAssessment(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTimeUpModal]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            Error Loading Assessment
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const assessmentQuestions = data?.content?.data || [];

  // Get timer color and styling based on remaining time
  const getTimerStyles = (seconds: number) => {
    if (seconds <= 300)
      return {
        bgColor: "bg-red-100 border-red-300",
        textColor: "text-red-800",
        pulseClass: "animate-pulse",
      }; // Last 5 minutes
    if (seconds <= 600)
      return {
        bgColor: "bg-orange-100 border-orange-300",
        textColor: "text-orange-800",
        pulseClass: "",
      }; // Last 10 minutes
    return {
      bgColor: "bg-blue-100 border-blue-300",
      textColor: "text-blue-800",
      pulseClass: "",
    };
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Utility to exit fullscreen mode
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Modified handleSubmitAssessment to support auto-submit and navigation
  const handleSubmitAssessment = async (isAutoSubmit = false) => {
    hasSubmittedRef.current = true;

    dispatch(startLoading());

    if (!assessmentQuestions.length) {
      setErrors({
        apiError: "No questions.",
      });
      setIsErrorModelOpen(true);
      dispatch(stopLoading());
      return;
    }

    // Backend expects: certTransactionId, tenantId, employeeId, questionGroupId (optional), answers[]
    const derivedQuestionGroupId =
      assessmentQuestions[0]?.questionGroupId ||
      assessmentQuestions[0]?.questionGroupId ||
      (certificationTransaction as any)?.questionGroupId ||
      (certificationTransaction as any)?.Certification?.AssessmentQuestions?.[0]?.questionGroupId;

    const formData = {
      certTransactionId: Number(certificationTransactionId),
      tenantId: Number(user?.tenentId?.id),
      employeeId: Number(user?.employeeId),
      ...(derivedQuestionGroupId
        ? { questionGroupId: String(derivedQuestionGroupId) }
        : {}),
      answers: assessmentQuestions.map((question) => ({
        questionId: question.questionId,
        userAnswer:
          answers[question.questionId] !== undefined &&
          answers[question.questionId] !== null &&
          answers[question.questionId] !== ""
            ? parseInt(answers[question.questionId])
            : null,
      })),
    } as const;

    try {
      await submitUserAssessmentApiFunction({ formData });
      exitFullscreen();
      setShowSubmittedModal(true);
      // Navigation will now be handled in SuccessModal's onConfirm/onClose
    } catch (error: any) {
      setErrors({
        apiError: error?.response?.data?.message || "Network Error",
      });
      setIsErrorModelOpen(true);
    } finally {
      dispatch(stopLoading());
    }
  };

  const timerStyles = timeLeft
    ? getTimerStyles(timeLeft)
    : { bgColor: "", textColor: "", pulseClass: "" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {timeLeft !== null && (
        <div className="fixed top-1 right-10 z-50">
          <div
            className={`
        ${timerStyles.bgColor} ${timerStyles.textColor} ${timerStyles.pulseClass}
        px-4.5 py-2.5 rounded-lg border shadow-md backdrop-blur-sm
        font-semibold text-sm transition-all duration-300 transform hover:scale-105
        flex items-center space-x-2
      `}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="tracking-wide">{formatTime(timeLeft)}</span>
          </div>
        </div>
      )}

      {/* Auto-submit Warning Modal */}
      <WarningModal
        isOpen={showAutoSubmitWarning}
        title="Assessment Auto-Submitting"
        subtitle="You are violating exam rules (leaving fullscreen, pressing Escape, switching tabs, or time expired). Your assessment will be auto-submitted."
        confirmText="OK"
        onConfirm={() => {
          setShowAutoSubmitWarning(false);
          handleSubmitAssessment(true);
        }}
        onClose={() => {
          setShowAutoSubmitWarning(false);
          handleSubmitAssessment(true);
        }}
      />
      {/* Time Up Modal */}
      <WarningModal
        isOpen={showTimeUpModal}
        title="Time's Up!"
        subtitle="Your time is finished, so the assessment is auto-submitted."
        confirmText="OK"
        onConfirm={() => {
          setShowTimeUpModal(false);
          navigate("/employee/certifications");
        }}
        onClose={() => {
          setShowTimeUpModal(false);
          navigate("/employee/certifications");
        }}
      />
      {/* Submitted Modal */}
      <SuccessModal
        isOpen={showSubmittedModal}
        title="Assessment Submitted"
        subtitle="Your assessment has been submitted successfully."
        confirmText="OK"
        onConfirm={() => {
          setShowSubmittedModal(false);
          navigate("/employee/certifications");
        }}
        onClose={() => {
          setShowSubmittedModal(false);
          navigate("/employee/certifications");
        }}
      />

      {/* Header Section */}
      <div className="">
        <Breadcrumb path="Assessment" subPath="View Assessment" />
      </div>

      <div className="w-full py-4 px-2 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar - Progress & Info */}

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-4 sticky top-15 w-full lg:max-w-xs mx-auto">
              {/* Progress Circle */}
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${
                        (Object.keys(answers).length /
                          assessmentQuestions.length) *
                        251.2
                      } 251.2`}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        (Object.keys(answers).length /
                          assessmentQuestions.length) *
                          100
                      )}
                      %
                    </span>
                    <span className="text-xs text-gray-500">Complete</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Questions
                  </span>
                  <span className="font-bold text-gray-900">
                    {assessmentQuestions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Answered
                  </span>
                  <span className="font-bold text-green-600">
                    {Object.keys(answers).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Remaining
                  </span>
                  <span className="font-bold text-orange-600">
                    {assessmentQuestions.length - Object.keys(answers).length}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Instructions
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Answer all questions</li>
                  <li>• Stay in fullscreen mode</li>
                  <li>• Don't switch tabs</li>
                  <li>• Submit before time expires</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content - Questions */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary px-4 py-4">
                <h2 className="text-2xl font-bold text-white">
                  Assessment Questions
                </h2>
                <p className="text-blue-100 mt-1">
                  Select the best answer for each question
                </p>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  {assessmentQuestions.map((q, index) => (
                    <div
                      key={q.questionId}
                      className={`
                        relative bg-gray-50 border-2 rounded-2xl p-8 transition-all duration-300
                        ${
                          answers[q.questionId]
                            ? "border-green-300 bg-green-50 shadow-lg"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                        }
                      `}
                    >
                      {/* Question Number Badge */}
                      <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {index + 1}
                      </div>

                      {/* Completion Check */}
                      {answers[q.questionId] && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}

                      <QuestionCard
                        question={q.questionText}
                        options={[
                          { label: q.option1, value: "1" },
                          { label: q.option2, value: "2" },
                          { label: q.option3, value: "3" },
                          { label: q.option4, value: "4" },
                          ...(q.option5
                            ? [{ label: q.option5, value: "5" }]
                            : []),
                        ]}
                        selected={answers[q.questionId]}
                        onSelect={(val) => handleSelect(q.questionId, val)}
                      />
                    </div>
                  ))}
                </div>

                {/* Submit Section */}
                {/* <div className="mt-10 pt-8 border-t-2 border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="text-center sm:text-left">
                      <p className="text-lg font-semibold text-gray-900">
                        Ready to submit your assessment?
                      </p>
                      <p className="text-gray-600 mt-1">
                        Make sure you've answered all questions before
                        proceeding.
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            Object.keys(answers).length ===
                            assessmentQuestions.length
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {Object.keys(answers).length}/
                          {assessmentQuestions.length} Questions
                        </div>
                      </div>

                      <ButtonPrimary
                        text={`Submit Assessment`}
                        onClick={() => handleSubmitAssessment()}
                        className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                          Object.keys(answers).length ===
                          assessmentQuestions.length
                            ? "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      />
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
          {/* Outside main scrollable area */}
          <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t-2 border-gray-100 z-50 px-4 sm:px-8 lg:px-10">
            <div className="max-w-7xl mx-auto py-4 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-center sm:text-left">
                <p className="text-lg font-semibold text-gray-900">
                  Ready to submit your assessment?
                </p>
                <p className="text-gray-600 mt-1">
                  Make sure you've answered all questions before proceeding.
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right font-bold">
                  <div
                    className={`${
                      Object.keys(answers).length === assessmentQuestions.length
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {Object.keys(answers).length}/{assessmentQuestions.length}{" "}
                    Questions
                  </div>
                </div>

                <ButtonPrimary
                  text={`Submit Assessment`}
                  onClick={() => handleSubmitAssessment()}
                  className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                    Object.keys(answers).length === assessmentQuestions.length
                      ? "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ErrorModal
        isOpen={isErrorModelOpen}
        title={errors.apiError || `Error While Uploading Assessment`}
        onCancel={() => {
          setIsErrorModelOpen(false);
          navigate(-1);
        }}
        onClose={() => {
          setIsErrorModelOpen(false);
          navigate(-1);
        }}
      />
    </div>
  );
};

export default ViewUserAssessment;
