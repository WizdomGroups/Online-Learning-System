import React, { useEffect, useState, useRef } from "react";

import Breadcrumb from "../../../components/Breadcrumb";

import BackButton from "../../../components/BackButton";

import { useNavigate, useSearchParams } from "react-router-dom";

import { fetchAssessmentAnswersByIdApiFunction } from "../../../lib/network/assessmentApis";

import { useAppDispatch } from "../../../lib/hooks/useAppDispatch";

import { useSelector } from "react-redux";

import { RootState } from "../../../store";

import ButtonPrimary from "../../../components/ButtonPrimary";

import ButtonSecondary from "../../../components/ButtonSecondary";

import {

  startLoading,

  stopLoading,

} from "../../../store/features/globalConstant/loadingSlice";

import ErrorModal from "../../../components/ErrorModal";

import {

  approveEmployeeCertificationApiFUnction,

  downloadLearnerCertificationPdfApiFUnction,

} from "../../../lib/network/certificationTransactionApis";

import { generateCertificatePdf } from "../../../lib/utils/generateCertificatePdf";

import useLocalStorageUserData from "../../../lib/hooks/useLocalStorageUserData";

import { message } from "antd";

import { Star, AlertCircle, CheckCircle } from "lucide-react";

import { createFeedbackApiFunction } from "../../../lib/network/feedbackApis";


interface FormData {

  certTransactionId: string | null;

  newStatus: string;

}

interface FormErrorType {

  [key: string]: string;

}



const ViewAssessmentUserAnswers: React.FC = () => {

  const { isTrainer, isAdmin, tenentId, isSuperAdmin, user } =

    useLocalStorageUserData();

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();

  const certTransactionId = searchParams.get("certTransactionId");

  const employeeId = searchParams.get("employeeId");

  const [formData] = useState<FormData>({

    certTransactionId: certTransactionId,

    newStatus: "",

  });

  const [errors, setErrors] = useState<FormErrorType>({});

  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);

  const [timer, setTimer] = useState<number>(0);

  const timerRef = useRef<number | null>(null);



  // Trainer feedback modal state

  const [showTrainerFeedbackModal, setShowTrainerFeedbackModal] =

    useState(false);

  const [isSubmittingTrainerFeedback, setIsSubmittingTrainerFeedback] =

    useState(false);

  const [trainerFeedbackError, setTrainerFeedbackError] = useState("");

  const [trainerFeedbackForm, setTrainerFeedbackForm] = useState({

    rating: 0,

    feedbackText: "",

    recommendToOthers: null as boolean | null,

  });

  const [trainerFeedbackSubmitted, setTrainerFeedbackSubmitted] = useState(false);
  const [trainerFeedbackData, setTrainerFeedbackData] = useState<{
    rating: number;
    feedbackText: string;
    submittedAt: string;
  } | null>(null);


  // Get assessmentTime from query params (e.g., ?assessmentTime=10)

  const assessmentTimeParam = searchParams.get("assessmentTime");

  const assessmentTime =

    assessmentTimeParam && !isNaN(Number(assessmentTimeParam))

      ? Number(assessmentTimeParam)

      : 0;



  const { data, error } = useSelector(

    (state: RootState) => state.assessmentAnswerById

  );



  const assessmentQuestions = Array.isArray(data?.content?.result)

    ? data.content.result

    : [];



  useEffect(() => {

    if (certTransactionId && employeeId) {

      dispatch(

        fetchAssessmentAnswersByIdApiFunction({ employeeId, certTransactionId })

      );

    }

  }, [certTransactionId, employeeId, dispatch]);


  // Load persisted trainer feedback if available
  useEffect(() => {
    if (!certTransactionId) return;
    const key = `trainer-feedback-${certTransactionId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTrainerFeedbackSubmitted(true);
        setTrainerFeedbackData(parsed);
      } catch {}
    }
  }, [certTransactionId]);


  // Start timer when questions are loaded

  useEffect(() => {

    if (assessmentTime > 0 && assessmentQuestions.length > 0) {

      setTimer(assessmentTime * 60); // convert minutes to seconds

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {

        setTimer((prev) => {

          if (prev <= 1) {

            clearInterval(timerRef.current!);

            return 0;

          }

          return prev - 1;

        });

      }, 1000);

    }

    return () => {

      if (timerRef.current) clearInterval(timerRef.current);

    };

  }, [assessmentQuestions.length, assessmentTime]);



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



  // console.log("Assessment Questions:", assessmentQuestions); // Keep for debugging if needed



  const getOptionLabel = (index: number) => ["A", "B", "C", "D", "E"][index];



  // Format timer as mm:ss

  const formatTime = (seconds: number) => {

    const m = Math.floor(seconds / 60)

      .toString()

      .padStart(2, "0");

    const s = (seconds % 60).toString().padStart(2, "0");

    return `${m}:${s}`;

  };



  const handleSubmit = async ({ newStatus }: { newStatus: string }) => {

    dispatch(startLoading());

    try {

      const updatedFormDate = {

        ...formData,

        newStatus,

      };

      await approveEmployeeCertificationApiFUnction({

        formData: updatedFormDate,

      });



      if (updatedFormDate.newStatus === "Completed") {

        if (isAdmin) {

          navigate("/admin/certifications/completed");

        } else {

          navigate("/trainer/certifications/completed");

        }

      } else if (updatedFormDate.newStatus === "Cancelled") {

        if (isAdmin) {

          navigate("/admin/certifications/cancelled");

        } else {

          navigate("/trainer/certifications/cancelled");

        }

      } else {

        navigate(-1);

      }

    } catch (error: unknown) {

      setIsErrorModelOpen(true);

      // Prefer backend error message if available

      const backendMessage =

        (error && typeof error === "object" && "response" in error

          ? (error.response as { data?: { message?: string } })?.data?.message

          : undefined) ||

        (error && typeof error === "object" && "message" in error

          ? (error as { message: string }).message

          : undefined) ||

        (typeof error === "string" ? error : "") ||

        "An unexpected error occurred";

      setErrors((prev) => ({

        ...prev,

        apiError: backendMessage,

      }));

    } finally {

      dispatch(stopLoading());

    }

  };



  const handleDownloadCertificationPdf = async () => {

    dispatch(startLoading());

    try {

      const response = await downloadLearnerCertificationPdfApiFUnction({

        certTransactionId: certTransactionId || "",

        tenantId: tenentId,

      });



      // Check if response has the expected structure

      if (!response.data || !response.data.content) {

        throw new Error("Invalid response format received from server.");

      }



      const certificationData = response.data.content;



      // Validate required data

      if (

        !certificationData.transaction ||

        !certificationData.certification ||

        !certificationData.company ||

        !certificationData.assessmentResult

      ) {

        throw new Error("Incomplete certification data received from server.");

      }



      // Generate PDF using the certification data

      generateCertificatePdf(certificationData);

    } catch (error: unknown) {

      setIsErrorModelOpen(true);

      const backendMessage =

        (error && typeof error === "object" && "response" in error

          ? (error.response as { data?: { message?: string } })?.data?.message

          : undefined) ||

        (error && typeof error === "object" && "message" in error

          ? (error as { message: string }).message

          : undefined) ||

        (typeof error === "string" ? error : "") ||

        "Failed to generate certificate PDF. Please try again.";

      setErrors((prev) => ({

        ...prev,

        apiError: backendMessage,

      }));

    } finally {

      dispatch(stopLoading());

    }

  };



  // Handlers for trainer feedback

  const handleTrainerStarClick = (rating: number) => {

    setTrainerFeedbackForm((prev) => ({ ...prev, rating }));

  };



  const handleSubmitTrainerFeedback = async () => {

    // Feedback is optional; if empty, allow submit but warn

    if (

      trainerFeedbackForm.rating === 0 &&

      !trainerFeedbackForm.feedbackText.trim()

    ) {

      setTrainerFeedbackError(

        "Provide rating or feedback (both optional but one helps)."

      );

      return;

    }

    setIsSubmittingTrainerFeedback(true);

    setTrainerFeedbackError("");

    try {

      // Call create feedback API from trainer side
      const tenantNumeric = Number((tenentId as any)?.id ?? tenentId);
      const createResponse = await createFeedbackApiFunction({
        employeeId: Number((user as any)?.employeeId),
        feedbackBy: "trainer",
        tenantId: tenantNumeric as number,
        certificateTransId: Number(certTransactionId),
        rating: trainerFeedbackForm.rating,
        feedbackText: trainerFeedbackForm.feedbackText,
      });

      const payload = {
        rating: trainerFeedbackForm.rating,
        feedbackText: trainerFeedbackForm.feedbackText,
        submittedAt: new Date().toISOString(),
      };
      setTrainerFeedbackSubmitted(true);
      setTrainerFeedbackData(payload);
      // persist
      if (certTransactionId) {
        localStorage.setItem(
          `trainer-feedback-${certTransactionId}`,
          JSON.stringify(payload)
        );
        // also persist feedback id to allow learner page to fetch by id
        try {
          const newId = (createResponse as any)?.content?.id;
          if (newId) {
            localStorage.setItem(
              `trainerFeedbackId:${certTransactionId}`,
              String(newId)
            );
          }
        } catch {}
      }

      message.success("Feedback sent to learner successfully.");

      setShowTrainerFeedbackModal(false);

    } catch (error) {

      setTrainerFeedbackError("Failed to send feedback. Please try again.");

    } finally {

      setIsSubmittingTrainerFeedback(false);

    }

  };



  const transactionStatus =

    assessmentQuestions[0]?.CertificationTransactionModel?.status;

  const certificationResult =

    assessmentQuestions[0]?.CertificationTransactionModel?.certificationResult;



  // Derived statistics (compact chips near action buttons)

  const totalQuestions = assessmentQuestions.length;

  const attemptedQuestions = assessmentQuestions.filter(

    (q: any) => typeof q.userAnswer === "number" && q.userAnswer > 0

  ).length;

  const correctAnswers = assessmentQuestions.filter(

    (q: any) => q.userAnswer && q.userAnswer === q.correctAnswer

  ).length;

  const scorePercent = totalQuestions

    ? Math.round((correctAnswers / totalQuestions) * 100)

    : 0;



  // Show submitted trainer feedback (persisted)
  const submittedTrainerFeedback = trainerFeedbackSubmitted && trainerFeedbackData ? {
    rating: trainerFeedbackData.rating,
    message: trainerFeedbackData.feedbackText,
    trainerName: "You",
    submittedAt: trainerFeedbackData.submittedAt,
  } : null;

  // Toggle to show full feedback without breaking layout
  const [showTrainerFeedbackDetails, setShowTrainerFeedbackDetails] = useState(false);


  return (

    <div className="bg-gray-50 min-h-screen">

      <Breadcrumb

        path="Assessment"

        subPath="Answers"

        subSubPath="View-answers-details"

      />



      <div className="px-4 sm:px-6 lg:px-8 py-6">

        {/* Combined Header Row */}

        <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 gap-4">

          <div className="flex items-center gap-3 flex-grow">

            <BackButton />

            <div>

              <h1 className="text-xl font-semibold text-gray-900">

                Assessment Review

              </h1>

              <p className="text-sm text-gray-500">

                Review candidate responses

              </p>

            </div>

          </div>



          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">

            {/* Status Badge */}

            {/* {transactionStatus && (

              <Tag

                className={`px-3 py-1 rounded-full text-xs font-medium ${

                  transactionStatus === "Completed"

                    ? "bg-green-100 text-green-700"

                    : transactionStatus === "Review"

                    ? "bg-amber-100 text-amber-700"

                    : "bg-gray-100 text-gray-700"

                }`}

              >

                {transactionStatus}

              </Tag>

            )} */}



            {/* Timer (if applicable) */}

            {assessmentTime > 0 && (

              <div className="flex items-center gap-2">

                <svg

                  className="w-4 h-4 text-orange-500"

                  fill="currentColor"

                  viewBox="0 0 20 20"

                >

                  <path

                    fillRule="evenodd"

                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"

                    clipRule="evenodd"

                  />

                </svg>

                <span className="text-sm font-medium text-gray-700">

                  Time Remaining:

                </span>

                <span className="text-lg font-mono font-bold text-orange-600">

                  {formatTime(timer)}

                </span>

              </div>

            )}

             {transactionStatus === "Completed" &&

              certificationResult === "Pass" && (

                <div className="flex gap-2 items-center">

                  <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">

                    <svg

                      className="w-2 h-2"

                      fill="currentColor"

                      viewBox="0 0 20 20"

                    >

                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />

                    </svg>

                    Passed

                  </span>

                  <ButtonPrimary

                    text="Download Certificate"

                    onClick={handleDownloadCertificationPdf}

                    className="px-4 py-2 text-sm" // Smaller button

                  />

                </div>

              )}



            {/* Compact Stats to the left of Action Buttons */}

            {/* <div className="flex items-center gap-2 mr-1"> */}
{/* 
              <span className="px-2 py-0.5 rounded-full text-xxs font-medium bg-gray-100 text-gray-700 border border-gray-200">

                Total: {totalQuestions}

              </span> */}
{/* 
              <span className="px-2 py-0.5 rounded-full text-xxs font-medium bg-gray-100 text-gray-700 border border-gray-200">

                Attempted: {attemptedQuestions}

              </span> */}

              {/* <span className="px-2 py-0.5 rounded-full text-xxs font-medium bg-green-100 text-green-700 border border-green-200">

                Correct: {correctAnswers}

              </span> */}

              {/* <span className="px-2 py-0.5 rounded-full text-xxs font-semibold bg-blue-100 text-blue-700 border border-blue-200">

                {scorePercent}%

              </span> */}

            {/* </div> */}


            {/* Submitted Trainer Feedback (shows once sent) */}
            {submittedTrainerFeedback && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTrainerFeedbackDetails((v) => !v)}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 px-3 py-2 rounded-md cursor-pointer"
                  aria-expanded={showTrainerFeedbackDetails}
                  aria-label="Toggle trainer feedback details"
                >
                  <div className="flex items-center gap-1" aria-label={`Rating ${submittedTrainerFeedback.rating} out of 5`}>
                    {[1,2,3,4,5].map((s)=> (
                      <Star key={s} className={`w-4 h-4 ${s <= submittedTrainerFeedback.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-700 italic truncate max-w-[320px] text-left">
                    “{submittedTrainerFeedback.message}”
                  </span>
                </button>

                {showTrainerFeedbackDetails && (
                  <div className="absolute right-0 mt-2 z-20 w-[360px] max-w-[90vw] bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {[1,2,3,4,5].map((s)=> (
                        <Star key={s} className={`w-4 h-4 ${s <= submittedTrainerFeedback.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-auto">
                        {submittedTrainerFeedback.submittedAt ? new Date(submittedTrainerFeedback.submittedAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {submittedTrainerFeedback.message}
                    </div>
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => setShowTrainerFeedbackDetails(false)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Action Buttons */}

            <div className="flex gap-2">

              {/* Show Send Feedback for all three statuses */}

              {(isTrainer || isAdmin) &&
                !trainerFeedbackSubmitted &&
                (["Completed", "Cancelled"] as string[]).includes(
                  (transactionStatus as string) || ""
                ) && (

                  <ButtonSecondary

                    text="Send Feedback"

                    onClick={() => setShowTrainerFeedbackModal(true)}

                    className="px-4 py-2 text-sm"

                  />

                )}



              {/* Show Approve & Reject only for "Review" */}

              {(isTrainer || isAdmin) && transactionStatus === "Review" && (

                <>

                  <ButtonSecondary

                    text="Reject"

                    onClick={() => handleSubmit({ newStatus: "Cancelled" })}

                    className="px-4 py-2 text-sm"

                  />

                  <ButtonPrimary

                    text="Approve"

                    onClick={() => handleSubmit({ newStatus: "Completed" })}

                    className="px-4 py-2 text-sm"

                  />

                </>

              )}

            </div>



           

          </div>

        </div>

       



        



        {/* Compact Questions */}

        <div className="space-y-4 ">

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

                CertificationTransactionModel?: {

                  status: string;

                  certificationResult?: string;

                };

              },

              index: number

            ) => (

              <div

                key={question.id}

                className="bg-white rounded-lg border border-gray-200 p-5"

              >

                {/* Question Header */}

                <div className="flex items-start gap-4 mb-4">

                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">

                    {index + 1}

                  </div>

                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-2">

                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">

                        Q{index + 1}

                      </span>

                      {/* Status Badge */}

                      {question.userAnswer && question.userAnswer > 0 ? (

                        question.userAnswer === question.correctAnswer ? (

                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">

                            <svg

                              className="w-3 h-3"

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

                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">

                            <svg

                              className="w-3 h-3"

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

                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">

                          Not Attempted

                        </span>

                      )}

                    </div>

                    <p className="text-gray-900 font-medium">

                      {question.questionText}

                    </p>

                  </div>

                </div>



                {/* Compact Options */}

                <div className="space-y-2 ml-11">

                  {[1, 2, 3, 4, 5].map((optionNum) => {

                    const optionValue = question[`option${optionNum}`];

                    const isCorrect = question.correctAnswer === optionNum;

                    const isUserAnswer = question.userAnswer === optionNum;



                    if (!optionValue) return null;



                    return (

                      <div

                        key={optionNum}

                        className={`p-3 rounded-md border text-sm ${

                          isCorrect

                            ? "bg-green-50 border-green-200 text-green-800"

                            : isUserAnswer && !isCorrect

                            ? "bg-red-50 border-red-200 text-red-800"

                            : "bg-gray-50 border-gray-200 text-gray-800"

                        }`}

                      >

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <span

                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${

                                isCorrect

                                  ? "bg-green-200 text-green-800"

                                  : isUserAnswer && !isCorrect

                                  ? "bg-red-200 text-red-800"

                                  : "bg-gray-200 text-gray-700"

                              }`}

                            >

                              {getOptionLabel(optionNum - 1)}

                            </span>

                            <span>{optionValue}</span>

                          </div>

                          {isCorrect && (

                            <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded">

                              ✓ Correct

                            </span>

                          )}

                          {isUserAnswer && !isCorrect && (

                            <span className="text-xs font-medium text-red-700 bg-red-200 px-2 py-1 rounded">

                              ✗ Selected

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



      {/* Trainer Feedback Modal */}

      {showTrainerFeedbackModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-lg mx-4">

            <div className="p-5 border-b border-gray-100">

              <h3 className="text-lg font-semibold text-gray-900">

                Send Feedback

              </h3>

              <p className="text-xs text-gray-500 mt-1">

                This will be sent to the learner.

              </p>

            </div>

            <div className="p-5">

              {/* Rating */}

              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-2">

                  Rate this assessment

                </label>

                <div className="flex items-center gap-1">

                  {[1, 2, 3, 4, 5].map((star) => (

                    <button

                      key={star}

                      type="button"

                      onClick={() => handleTrainerStarClick(star)}

                      className="p-1 hover:scale-110 transition-transform duration-200"

                    >

                      <Star

                        className={`w-7 h-7 ${

                          star <= trainerFeedbackForm.rating

                            ? "text-yellow-500 fill-current"

                            : "text-gray-300 hover:text-yellow-400"

                        }`}

                      />

                    </button>

                  ))}

                </div>

                {trainerFeedbackForm.rating > 0 && (

                  <p className="text-xs text-gray-600 mt-1">

                    {trainerFeedbackForm.rating === 1 && "Poor"}

                    {trainerFeedbackForm.rating === 2 && "Fair"}

                    {trainerFeedbackForm.rating === 3 && "Good"}

                    {trainerFeedbackForm.rating === 4 && "Very Good"}

                    {trainerFeedbackForm.rating === 5 && "Excellent"}

                  </p>

                )}

              </div>



              {/* Feedback text */}

              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-2">

                  Feedback to learner

                </label>

                <textarea

                  value={trainerFeedbackForm.feedbackText}

                  onChange={(e) =>

                    setTrainerFeedbackForm((prev) => ({

                      ...prev,

                      feedbackText: e.target.value,

                    }))

                  }

                  placeholder="Share strengths, areas to improve, and suggestions…"

                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"

                  rows={4}

                  maxLength={500}

                />

                <div className="text-right text-xxs text-gray-500 mt-1">

                  {trainerFeedbackForm.feedbackText.length}/500

                </div>

              </div>



              {trainerFeedbackError && (

                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded">

                  <p className="text-xs text-red-700">{trainerFeedbackError}</p>

                </div>

              )}

            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">

              <button

                onClick={() => setShowTrainerFeedbackModal(false)}

                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"

                disabled={isSubmittingTrainerFeedback}

              >

                Close

              </button>

              <button

                onClick={handleSubmitTrainerFeedback}

                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"

                disabled={isSubmittingTrainerFeedback}

              >

                {isSubmittingTrainerFeedback ? "Sending…" : "Send Feedback"}

              </button>

            </div>

          </div>

        </div>

      )}

      <ErrorModal

        isOpen={isErrorModelOpen}

        title={errors.apiError || `Error`}

        onCancel={() => {

          setIsErrorModelOpen(false);

        }}

        onClose={() => {

          setIsErrorModelOpen(false);

        }}

      />

    </div>

  );

};



export default ViewAssessmentUserAnswers;

