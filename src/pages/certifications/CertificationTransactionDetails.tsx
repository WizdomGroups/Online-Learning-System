import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ErrorMessage from "../../components/ErrorMessage";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import {
  fetchCertificationTransactionByIdApiFunction,
  updateCertificationTransactionApiFunction,
  downloadLearnerCertificationPdfApiFUnction,
} from "../../lib/network/certificationTransactionApis";
import { generateCertificatePdf } from "../../lib/utils/generateCertificatePdf";

import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { reAssignedCertificationApiFunction } from "../../lib/network/certificationApi";
import ErrorModal from "../../components/ErrorModal";
import useLocalStorageData from "../../lib/hooks/useLocalStorageUserData";
import { Button, message, Progress, Tag } from "antd";
import {
  Download,
  Clock,
  FileText,
  Star,
  Users,
  BookOpen,
  AlertCircle,
  Award,
  Target,
  User,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { downloadDocumentAttachment } from "../../lib/network/documentApis";
import { fetchLearnerFeedbackById } from "../../lib/network/feedbackApis";
import { createFeedbackApiFunction } from "../../lib/network/feedbackApis";
import ButtonSecondary from "../../components/ButtonSecondary";

interface FormErrorType {
  [key: string]: string;
}

// Type definitions for better type safety
interface ModuleType {
  name?: string;
  description?: string;
  Documents?: DocumentType[];
}

interface DocumentType {
  id: number;
  name: string;
  files?: FileType[];
}

interface FileType {
  id: number;
  filePath: string;
  version: number;
  status: string;
}

interface CertificationType {
  assessmentTime?: number;
  totalAssessmentQuestions?: number;
  passPercentage?: string | number;
  description?: string;
  Modules?: ModuleType[];
}

interface InstructorType {
  name: string;
  title: string;
  rating: string;
  students: string;
  modules: string;
}

interface TrainerType {
  firstName?: string;
  lastName?: string;
}

interface TrainingType {
  id: number;
  trainingName: string;
  trainingCode: string;
  description: string;
  status: string;
  tenantId: number;
  branchId?: number;
  createdAt: string;
  updatedAt: string;
  CertificationTraining: {
    id: number;
    certificationId: number;
    trainingId: number;
    tenantId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  Modules: ModuleType[];
}

interface AssessmentQuestion {
  questionId: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctAnswer: number;
  status: string;
  complexity: string;
  questionGroupId: string;
}

interface CertificationWithTrainings extends CertificationType {
  trainings?: TrainingType[];
  AssessmentQuestions?: AssessmentQuestion[];
  isAssessmentRequired?: boolean;
}

// Enhanced Description Component with better styling
const DescriptionSection = ({ description }: { description?: string }) => (
  <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-blue-50 rounded-md">
        <FileText className="w-4 h-4 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Course Description</h3>
    </div>
    <div className="prose prose-sm max-w-none">
      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap break-words break-all">
        {description || "No description available for this certification."}
      </p>
    </div>
  </div>
);

// Enhanced Modules Component with improved layout and animations
const ModulesSection = ({ trainings }: { trainings: TrainingType[] }) => {
  // Extract all modules from all trainings
  const allModules =
    trainings?.flatMap(
      (training) =>
        training.Modules?.map((module: ModuleType) => ({
          ...module,
          trainingName: training.trainingName,
          trainingId: training.id,
        })) || []
    ) || [];
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const dispatch = useAppDispatch();

  // Download handler for document files
  const handleDownload = async (
    fileId: number,
    filePath: string,
    version: number,
    documentId: number
  ) => {
    try {
      setDownloadingFile(fileId);
      dispatch(startLoading());
      const blob = await downloadDocumentAttachment(documentId, fileId);
      const ext = filePath.split(".").pop() || "file";
      const downloadFileName = `document-${documentId}-v${version}.${ext}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success("File downloaded successfully!");
    } catch (error: unknown) {
      let errorMessage = "Failed to download file. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const { status, data } =
          (
            error as {
              response: { status?: number; data?: { message?: string } };
            }
          ).response || {};
        switch (status) {
          case 404:
            errorMessage = data?.message || "File not found.";
            break;
          case 403:
            errorMessage =
              "Access denied. You don't have permission to download this file.";
            break;
          case 400:
            errorMessage =
              data?.message || "Invalid request. Please try again.";
            break;
          case 500:
            errorMessage =
              "Server error. Please try again later or contact support.";
            break;
          default:
            errorMessage =
              data?.message || "Download failed. Please try again.";
        }
      } else if (error && typeof error === "object" && "request" in error) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else {
        const errorObj = error as { message?: string };
        errorMessage = errorObj.message || "An unexpected error occurred.";
      }
      message.error(errorMessage);
    } finally {
      setDownloadingFile(null);
      dispatch(stopLoading());
    }
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-green-50 rounded-md">
          <BookOpen className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Course Modules</h3>
        <div className="ml-auto">
          <Tag color="blue" className="text-xs px-2 py-0.5">
            {allModules?.length || 0} Modules
          </Tag>
        </div>
      </div>

      {allModules?.length > 0 ? (
        <div className="space-y-3">
          {allModules.map((mod, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div
                className="p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:from-blue-50 hover:to-white transition-all duration-300"
                onClick={() =>
                  setExpandedModule(expandedModule === index ? null : index)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base text-gray-900 mb-0.5 break-words break-all whitespace-pre-wrap">
                        {mod.name || `Module ${index + 1}`}
                      </h4>
                      <p className="text-blue-600 text-xs font-medium mb-1 break-words break-all whitespace-pre-wrap">
                        From: {mod.trainingName}
                      </p>
                      {mod.description && (
                        <p className="text-gray-600 text-xs line-clamp-1 break-words break-all whitespace-pre-wrap">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mod?.Documents && mod.Documents.length > 0 && (
                      <Tag color="orange" className="text-xs">
                        {mod.Documents.length} Documents
                      </Tag>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform duration-300 ${expandedModule === index ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </div>
              </div>

              {expandedModule === index && (
                <div className="px-4 pb-4 bg-white animate-fadeIn">
                  {mod.description && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <h5 className="font-semibold text-gray-800 text-sm mb-1">
                        Module Description
                      </h5>
                      <p className="text-gray-700 text-xs leading-relaxed break-words break-all whitespace-pre-wrap">
                        {mod.description}
                      </p>
                    </div>
                  )}

                  {mod?.Documents && mod.Documents.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Module Documents
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mod.Documents?.map(
                          (doc: DocumentType, docIndex: number) => (
                            <div
                              key={docIndex}
                              className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow"
                            >
                              <div className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-1.5 break-words break-all whitespace-pre-wrap">
                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                {doc.name}
                              </div>
                              {doc.files &&
                                doc.files.length > 0 &&
                                doc.files
                                  .filter(
                                    (file: FileType) => file.status === "active"
                                  )
                                  .map((file: FileType) => (
                                    <div
                                      key={file.id}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-1.5 last:mb-0"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs text-gray-700 truncate block break-words break-all">
                                          {file.filePath.split("/").pop()}
                                        </span>
                                        <span className="text-xxs text-gray-500">
                                          Version {file.version}
                                        </span>
                                      </div>
                                      <Button
                                        type="primary"
                                        size="small"
                                        icon={<Download className="w-3 h-3" />}
                                        loading={downloadingFile === file.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownload(
                                            file.id,
                                            file.filePath,
                                            file.version,
                                            doc.id
                                          );
                                        }}
                                        className="ml-2 px-3 py-1 text-xs"
                                      >
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No modules available for this certification.
          </p>
        </div>
      )}
    </div>
  );
};

// Enhanced Assessment Component
const AssessmentSection = ({
  certification,
}: {
  certification: CertificationType;
}) => {
  const assessmentData = [
    {
      label: "Assessment Time",
      value: certification?.assessmentTime
        ? `${certification.assessmentTime} Mins`
        : "N/A",
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Total Questions",
      value: certification?.totalAssessmentQuestions ?? "N/A",
      icon: <Target className="w-4 h-4 text-green-500" />,
      color: "green",
    },
    {
      label: "Pass Percentage",
      value: certification?.passPercentage
        ? `${certification.passPercentage}%`
        : "N/A",
      icon: <Award className="w-4 h-4 text-orange-500" />,
      color: "orange",
    },
  ];

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-purple-50 rounded-md">
          <Target className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Assessment Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assessmentData.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <h4 className="font-semibold text-gray-800 text-sm">
                {item.label}
              </h4>
            </div>
            <div className="text-xl font-bold text-gray-900">{item.value}</div>
            {item.label === "Pass Percentage" &&
              certification?.passPercentage && (
                <div className="mt-2">
                  <Progress
                    percent={
                      typeof certification.passPercentage === "string"
                        ? parseInt(certification.passPercentage)
                        : certification.passPercentage
                    }
                    strokeColor="#f59e0b"
                    trailColor="#f3f4f6"
                    size="small"
                    showInfo={false}
                  />
                  <span className="text-xs text-gray-600 mt-1 block">
                    Target: {certification.passPercentage}%
                  </span>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Instructor Component
const InstructorSection = ({
  instructors,
  trainer,
}: {
  instructors: InstructorType[];
  trainer: TrainerType;
}) => (
  <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="flex items-center gap-2 mb-6">
      <div className="p-1.5 bg-indigo-50 rounded-md">
        <User className="w-4 h-4 text-indigo-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Course Instructor</h3>
    </div>

    <div className="space-y-4">
      {instructors.map((instructor, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <div className="flex-shrink-0">
              <img
                src="/images/default-profile-image.webp"
                alt={instructor.name}
                className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="mb-3">
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {`${trainer?.firstName || ""} ${trainer?.lastName || ""
                    }`.trim() || "Instructor Name"}
                </h4>
                <p className="text-base text-gray-600 mb-2">
                  {instructor.title}
                </p>
              </div>

              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-100">
                  <div className="p-1.5 bg-yellow-50 rounded-md">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {instructor.rating}
                    </div>
                    <div className="text-xs text-gray-600">Course Rating</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-100">
                  <div className="p-1.5 bg-blue-50 rounded-md">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {instructor.students}
                    </div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white rounded-md border border-gray-100">
                  <div className="p-1.5 bg-green-50 rounded-md">
                    <BookOpen className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {instructor.modules}
                    </div>
                    <div className="text-xs text-gray-600">Modules</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Enhanced Review Component
const ReviewSection = ({
  feedback,
}: {
  feedback: null | {
    reviewer: string;
    rating: number;
    message: string;
    date?: string;
  };
}) => (
  <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="flex items-center gap-2 mb-6">
      <div className="p-1.5 bg-yellow-50 rounded-md">
        <Star className="w-4 h-4 text-yellow-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Feedback From Learner</h3>
    </div>

    {!feedback ? (
      <div className="text-center py-8">
        <Star className="w-14 h-14 text-gray-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-gray-600 mb-1.5">
          No Feedback Available
        </h4>
        <p className="text-gray-500 text-sm">
          Learners have not submitted feedback for this certification yet.
        </p>
      </div>
    ) : (
      <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <img
                src="/images/default-profile-image.webp"
                alt={feedback.reviewer}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {feedback.reviewer}
                </div>
                {feedback.date && (
                  <div className="text-xxs text-gray-500">{feedback.date}</div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words break-all max-h-48 overflow-y-auto">
              {feedback.message}
            </p>
          </div>
          <div
            className="flex items-center gap-0.5 ml-3"
            aria-label={`Rating ${feedback.rating} out of 5`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= feedback.rating
                    ? "text-yellow-500 fill-current"
                    : "text-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

// Enhanced Tab Button Component
const TabButton = ({
  label,
  isActive,
  onClick,
  icon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) => (
  <button
    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${isActive
        ? "bg-blue-600 text-white shadow-md transform scale-100"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

const CertificationTransactionDetails = () => {
  const { isAdmin, isTrainer, isSuperAdmin } = useLocalStorageData();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, tenentId } = useLocalStorageUserData();
  const [searchParams] = useSearchParams();
  const certificateTransactionId = searchParams.get(
    "certificationTransactionId"
  );

  console.log("user-->", user);

  const {
    data: certification,
    loading,
    error,
  } = useSelector((state: RootState) => state.certificationTransactionById);
  const { learnerFeedbackById } = useSelector(
    (state: RootState) => (state as any).feedback
  );

  // Add state for active tab
  const [activeTab, setActiveTab] = useState("overview");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmModelOpen, setConfirmModelOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrorType>({});
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);
  // Trainer feedback modal state
  const [showTrainerFeedbackModal, setShowTrainerFeedbackModal] = useState(false);
  const [isSubmittingTrainerFeedback, setIsSubmittingTrainerFeedback] = useState(false);
  const [trainerFeedbackError, setTrainerFeedbackError] = useState("");
  const [trainerFeedbackForm, setTrainerFeedbackForm] = useState({
    rating: 0,
    feedbackText: "",
  });
  const [trainerFeedbackSubmitted, setTrainerFeedbackSubmitted] = useState(false);
  const [trainerFeedbackData, setTrainerFeedbackData] = useState<{
    rating: number;
    feedbackText: string;
    submittedAt: string;
  } | null>(null);
  const [showTrainerFeedbackDetails, setShowTrainerFeedbackDetails] = useState(false);

  useEffect(() => {
    if (certificateTransactionId) {
      dispatch(
        fetchCertificationTransactionByIdApiFunction({
          certificateTransactionId,
        })
      );
    }
  }, [dispatch, certificateTransactionId]);

  // Fetch learner feedback by stored id or query param (only if feedback required)
  useEffect(() => {
    const feedbackRequired = Boolean(
      (certification as any)?.Certification?.isFeedbackRequired === true
    );
    if (!feedbackRequired) return;
    let learnerFeedbackId = searchParams.get("learnerFeedbackId");
    if (!learnerFeedbackId && certificateTransactionId) {
      try {
        const stored = localStorage.getItem(
          `learnerFeedbackId:${certificateTransactionId}`
        );
        if (stored) learnerFeedbackId = stored;
      } catch { }
    }
    const tenant = (user as any)?.tenentId?.id;
    if (learnerFeedbackId && tenant) {
      dispatch(
        fetchLearnerFeedbackById({
          feedbackId: learnerFeedbackId,
          tenantId: tenant,
        })
      );
    }
  }, [dispatch, searchParams, certificateTransactionId, user, certification]);

  // Load persisted trainer feedback if available (for showing in header)
  useEffect(() => {
    if (!certificateTransactionId) return;
    const key = `trainer-feedback-${certificateTransactionId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTrainerFeedbackSubmitted(true);
        setTrainerFeedbackData(parsed);
      } catch { }
    }
  }, [certificateTransactionId]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Show loading state while data is being fetched
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
  //         <h2 className="text-lg font-semibold text-gray-600 mb-1.5">
  //           Loading Certification...
  //         </h2>
  //         <p className="text-gray-500 text-sm">
  //           Please wait while we fetch the certification details.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // Only show "Not Found" if we have finished loading and still no data
  if (!certificateTransactionId || (!loading && !certification)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <AlertCircle className="w-14 h-14 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-600 mb-1.5">
            Certification Not Found
          </h2>
          <p className="text-gray-500 text-sm">
            The requested certification could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  console.log("certification-->", certification);

  const instructors: InstructorType[] = [
    {
      name: "Vako Shvili",
      title: "Web Designer & Best-Selling Instructor",
      rating: "4.9",
      students: "235,568",
      modules: "09",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <DescriptionSection
              description={certification?.Certification?.description || ""}
            />
            <ModulesSection
              trainings={
                (certification?.Certification as CertificationWithTrainings)
                  ?.trainings || ([] as TrainingType[])
              }
            />
            <AssessmentSection
              certification={
                certification?.Certification || ({} as CertificationType)
              }
            />
            <InstructorSection
              instructors={instructors}
              trainer={certification?.trainer || ({} as TrainerType)}
            />
          </>
        );
      case "modules":
        return (
          <ModulesSection
            trainings={
              (certification?.Certification as CertificationWithTrainings)
                ?.trainings || ([] as TrainingType[])
            }
          />
        );
      case "assessment":
        return (
          <AssessmentSection
            certification={
              certification?.Certification || ({} as CertificationType)
            }
          />
        );
      case "instructor":
        return (
          <InstructorSection
            instructors={instructors}
            trainer={certification?.trainer || ({} as TrainerType)}
          />
        );
      case "review": {
        const mapped = (learnerFeedbackById as any)
          ? {
            reviewer:
              `${(learnerFeedbackById as any)?.employee?.firstName || ""} ${(learnerFeedbackById as any)?.employee?.lastName || ""
                }`.trim() || "Learner",
            rating: Number((learnerFeedbackById as any)?.rating) || 0,
            message: (learnerFeedbackById as any)?.feedback || "", // <-- changed from feedbackText to feedback
            date: (learnerFeedbackById as any)?.createdAt
              ? new Date(
                (learnerFeedbackById as any).createdAt
              ).toLocaleDateString()
              : undefined,
          }
          : null;
        return <ReviewSection feedback={mapped} />;
      }
      default:
        return null;
    }
  };

  const handleConfirmDocumentRead = async () => {
    if (!certification?.documentReadStatus) {
      dispatch(startLoading());
      try {
        const certificationTransactionId = certificateTransactionId;

        const formData = {
          companyId: user?.tenentId?.id,
          employeeId: user?.employeeId,
          certificationId: certification?.certificationId,
          documentReadStatus: true,
        };

        await updateCertificationTransactionApiFunction({
          formData,
          certificationTransactionId,
        });
        setIsConfirmed(true);
      } catch (error: unknown) {
        setIsErrorModelOpen(true);
        setErrors({
          apiError:
            (error && typeof error === "object" && "response" in error
              ? (error.response as { data?: { message?: string } })?.data
                ?.message
              : undefined) || "Network Error",
        });
      } finally {
        dispatch(stopLoading());
      }
    } else {
      setIsConfirmed(true);
    }
  };

  const questionGroupId =
    (certification?.Certification as CertificationWithTrainings)
      ?.AssessmentQuestions?.[0]?.questionGroupId || null;

  console.log("questionGroupId-->", questionGroupId);

  const handleDownloadCertificationPdf = async (certTransactionId: string) => {
    console.log("=== STARTING PDF DOWNLOAD PROCESS ===");
    console.log("Certificate transaction ID:", certTransactionId);
    console.log("Tenant ID:", tenentId);
    console.log("Current certification:", certification);

    setIsDownloadingCert(true);
    dispatch(startLoading());
    try {
      console.log("Calling API with:", {
        certTransactionId: certTransactionId,
        tenantId: tenentId,
      });

      const response = await downloadLearnerCertificationPdfApiFUnction({
        certTransactionId: certTransactionId,
        tenantId: tenentId,
      });

      console.log("API response received:", response);

      // Check if response has the expected structure
      if (!response.data || !response.data.content) {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response format received from server.");
      }

      const certificationData = response.data.content;
      console.log("Certification data:", certificationData);

      // Validate required data
      if (
        !certificationData.transaction ||
        !certificationData.certification ||
        !certificationData.company
      ) {
        console.error("Missing required data:", {
          transaction: !!certificationData.transaction,
          certification: !!certificationData.certification,
          company: !!certificationData.company,
        });
        throw new Error("Incomplete certification data received from server.");
      }

      // For assessment-based certifications, validate assessmentResult exists
      // For training-only certifications, assessmentResult can be null
      const certWithTrainings =
        certification?.Certification as CertificationWithTrainings;
      const hasAssessment =
        certWithTrainings?.isAssessmentRequired === true ||
        (certWithTrainings?.AssessmentQuestions &&
          certWithTrainings.AssessmentQuestions.length > 0);

      console.log("Has assessment:", hasAssessment);
      console.log("Assessment result:", certificationData.assessmentResult);
      console.log("Current certification object:", certification);

      if (hasAssessment && !certificationData.assessmentResult) {
        console.error("Assessment required but missing assessmentResult");
        throw new Error(
          "Assessment result data is missing for assessment-based certification."
        );
      }

      console.log(
        "All validations passed. About to call generateCertificatePdf..."
      );
      // Generate PDF using the certification data
      generateCertificatePdf(certificationData);
      console.log("generateCertificatePdf completed successfully!");

      // Show success message
      message.success("Certificate PDF generated successfully!");
    } catch (error: unknown) {
      console.error("=== ERROR IN PDF DOWNLOAD ===");
      console.error("Error details:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );

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
      console.log("Final error message:", backendMessage);
      setErrors((prev) => ({
        ...prev,
        apiError: backendMessage,
      }));
    } finally {
      console.log("=== PDF DOWNLOAD PROCESS COMPLETED ===");
      setIsDownloadingCert(false);
      dispatch(stopLoading());
    }
  };

  const handleClickReAssigned = async () => {
    try {
      dispatch(startLoading());

      const formData = {
        employeeId: certification?.employeeId,
        certificationId: certification?.certificationId,
        certTransactionId: certification?.id,
      };

      const payloadToSend = [formData];

      await reAssignedCertificationApiFunction({ formData: payloadToSend });

      if (isAdmin) {
        navigate("/admin/certifications/re-assigned");
      } else {
        navigate("/trainer/certifications/re-assigned");
      }
    } catch (error: unknown) {
      console.error("Re-assign error:", error);

      setIsErrorModelOpen(true);
      const backendMessage =
        (error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : undefined) ||
        (error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined) ||
        (typeof error === "string" ? error : "") ||
        "Error While Re-Assigning";

      setErrors({
        apiError: backendMessage,
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  const isFeedbackRequired = Boolean(
    (certification as any)?.Certification?.isFeedbackRequired === true
  );

  const isAssessmentRequired = Boolean(
    (certification as any)?.Certification?.isAssessmentRequired === true
  );

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "modules",
      label: "Modules",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      key: "assessment",
      label: "Assessment",
      icon: <Target className="w-4 h-4" />,
    },
    {
      key: "instructor",
      label: "Instructor",
      icon: <User className="w-4 h-4" />,
    },
    ...(isFeedbackRequired
      ? [
        {
          key: "review",
          label: " FeedBack",
          icon: <MessageCircle className="w-4 h-4" />,
        },
      ]
      : []),
  ];

  // Derived submitted trainer feedback for display
  const submittedTrainerFeedback =
    trainerFeedbackSubmitted && trainerFeedbackData
      ? {
        rating: trainerFeedbackData.rating,
        message: trainerFeedbackData.feedbackText,
        trainerName: "You",
        submittedAt: trainerFeedbackData.submittedAt,
      }
      : null;

  const canDownloadCertificate =
    certification?.certificationResult === "Pass" &&
    certification?.status === "Completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden">
      <Breadcrumb path="Certifications" subPath="Certification Details" />
      <div className="relative">
        {canDownloadCertificate && (
          <button
            onClick={() =>
              handleDownloadCertificationPdf(
                certificateTransactionId || ""
              )
            }
            disabled={isDownloadingCert}
            className={`absolute top-0 right-20 px-2 py-1.5 text-sm text-white rounded-md flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isDownloadingCert
                ? "bg-green-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isDownloadingCert ? (
              <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isDownloadingCert
              ? "Downloading..."
              : "Download Certificate"}
          </button>
        )}
      </div>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <BackButton />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 break-words break-all whitespace-pre-wrap">
                    {certification?.Certification?.title}
                  </h1>

                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/default-profile-image.webp"
                      alt="Instructor"
                      className="w-8 h-8 rounded-full object-cover border-1.5 border-gray-200"
                    />
                    <div>
                      <span className="text-gray-600 text-xs">Created by:</span>
                      <span className="text-gray-900 font-semibold ml-1.5 text-sm break-words break-all whitespace-pre-wrap">
                        {`${certification?.trainer?.firstName || ""} ${certification?.trainer?.lastName || ""
                          }`.trim() || "Instructor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {certification?.status !== "Assigned" &&
                certification?.status !== "Re-assigned" &&
                isAssessmentRequired && (
                  <ButtonPrimary
                    text="View User Submission"
                    onClick={() => {
                      if (isSuperAdmin) {
                        navigate(
                          `/super-admin/certifications/user-certifications-assessment?certTransactionId=${certification?.id}&employeeId=${certification?.employeeId}`
                        );
                      } else if (isAdmin) {
                        navigate(
                          `/admin/certifications/user-certifications-assessment?certTransactionId=${certification?.id}&employeeId=${certification?.employeeId}`
                        );
                      } else if (isTrainer) {
                        navigate(
                          `/trainer/certifications/user-certifications-assessment?certTransactionId=${certification?.id}&employeeId=${certification?.employeeId}`
                        );
                      } else {
                        navigate(
                          `/employee/certifications/user-certifications-assessment?certTransactionId=${certification?.id}&employeeId=${certification?.employeeId}`
                        );
                      }
                    }}
                    className="px-5 py-2.5 text-sm"
                  />
                )}

              {!isAssessmentRequired && !submittedTrainerFeedback && (
                <ButtonSecondary
                  text="Send Feedback"
                  onClick={() => setShowTrainerFeedbackModal(true)}
                  className="px-5 py-2.5 text-sm"
                />
              )}

              {/* Submitted Trainer Feedback (shows once sent) */}
              {/* {submittedTrainerFeedback && (
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
                          <Star key={s} className={`w-4 h-4 ${s <= submittedTrainerFeedback.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`} />)
                        )}
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
              )} */}

              {(certification?.status === "Cancelled" ||
                certification?.status === "Completed") && (
                  <ButtonPrimary
                    text="Re-Assign"
                    onClick={handleClickReAssigned}
                    className="px-5 py-2.5 text-sm"
                  />
                )}
            </div>
          </div>
        </div>

        <main>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex flex-nowrap gap-1.5">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.key}
                    label={tab.label}
                    icon={tab.icon}
                    isActive={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="animate-fadeIn">{renderContent()}</div>

          {/* Confirm Modal */}
          <SuccessModal
            isOpen={confirmModelOpen}
            title="Please confirm that you’ve read the module document before starting the assessment."
            cancelText="Go Back"
            confirmText="Yes, I’ve Read It"
            onCancel={() => setConfirmModelOpen(false)}
            onConfirm={() => {
              if (isConfirmed) {
                navigate(
                  `/employee/certifications/certifications-assessment?certificationTransactionId=${certificateTransactionId}&questionGroupId=${questionGroupId}`
                );
              } else {
                setConfirmModelOpen(false);
                handleConfirmDocumentRead();
              }
            }}
          />

          {/* Error Modal */}
          <ErrorModal
            isOpen={isErrorModelOpen}
            title={errors.apiError || "Error While Uploading Assessment"}
            onCancel={() => setIsErrorModelOpen(false)}
            onClose={() => setIsErrorModelOpen(false)}
          />

          {/* Trainer Feedback Modal */}
          {showTrainerFeedbackModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-lg mx-4">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Send Feedback</h3>
                  <p className="text-xs text-gray-500 mt-1">This will be sent to the learner.</p>
                </div>

                <div className="p-5">
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rate this assessment</label>
                    <div className="flex items
                    -center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setTrainerFeedbackForm((prev) => ({ ...prev, rating: star }))}
                          className="p-1 hover:scale-110 transition-transform duration-200"
                        >
                          <Star
                            className={`w-7 h-7 ${star <= trainerFeedbackForm.rating
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback to learner</label>
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
                    onClick={async () => {
                      // Optional validation: allow empty but warn
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
                        const tenantNumeric = Number((tenentId as any)?.id ?? tenentId);
                        const createResponse = await createFeedbackApiFunction({
                          employeeId: Number((user as any)?.employeeId),
                          feedbackBy: "trainer",
                          tenantId: tenantNumeric as number,
                          certificateTransId: Number(certificateTransactionId),
                          rating: trainerFeedbackForm.rating,
                          feedbackText: trainerFeedbackForm.feedbackText,
                        });

                        // persist minimal feedback locally and update UI state immediately
                        if (certificateTransactionId) {
                          const payload = {
                            rating: trainerFeedbackForm.rating,
                            feedbackText: trainerFeedbackForm.feedbackText,
                            submittedAt: new Date().toISOString(),
                          };
                          setTrainerFeedbackSubmitted(true);
                          setTrainerFeedbackData(payload);
                          localStorage.setItem(
                            `trainer-feedback-${certificateTransactionId}`,
                            JSON.stringify(payload)
                          );
                          try {
                            const newId = (createResponse as any)?.content?.id;
                            if (newId) {
                              localStorage.setItem(
                                `trainerFeedbackId:${certificateTransactionId}`,
                                String(newId)
                              );
                            }
                          } catch { }
                        }

                        message.success("Feedback sent to learner successfully.");
                        setShowTrainerFeedbackModal(false);
                      } catch (err) {
                        setTrainerFeedbackError("Failed to send feedback. Please try again.");
                      } finally {
                        setIsSubmittingTrainerFeedback(false);
                      }
                    }}
                    className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    disabled={isSubmittingTrainerFeedback}
                  >
                    {isSubmittingTrainerFeedback ? "Sending…" : "Send Feedback"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CertificationTransactionDetails;
