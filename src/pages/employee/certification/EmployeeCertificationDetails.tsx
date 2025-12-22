import React, { useEffect, useState, useRef, useMemo } from "react";
import { useAppDispatch } from "../../../lib/hooks/useAppDispatch";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import ErrorMessage from "../../../components/ErrorMessage";
import Breadcrumb from "../../../components/Breadcrumb";
import BackButton from "../../../components/BackButton";
import {
  fetchCertificationTransactionByIdApiFunction,
  updateCertificationTransactionApiFunction,
  updateCertificationStatusResultApiFunction,
} from "../../../lib/network/certificationTransactionApis";
import ButtonPrimary from "../../../components/ButtonPrimary";
import SuccessModal from "../../../components/SuccessModel";
import {
  startLoading,
  stopLoading,
} from "../../../store/features/globalConstant/loadingSlice";
import useLocalStorageUserData from "../../../lib/hooks/useLocalStorageUserData";
import { Button, message, Progress, Tag, Tooltip } from "antd";
import {
  Download,
  Clock,
  FileText,
  CheckCircle,
  Star,
  Users,
  BookOpen,
  AlertCircle,
  Award,
  Target,
  User,
  ChevronDown,
  MessageCircle,
  Send, // Added for module expand/collapse
  Paperclip, // Added for attachments
} from "lucide-react";
import { downloadDocumentAttachment } from "../../../lib/network/documentApis";
import { downloadLearnerCertificationPdfApiFUnction } from "../../../lib/network/certificationTransactionApis";
import { generateCertificatePdf } from "../../../lib/utils/generateCertificatePdf";
import { createFeedbackApiFunction } from "../../../lib/network/feedbackApis";
import {
  fetchTrainerFeedbackById,
  fetchTrainerFeedbackByCertTransId,
} from "../../../lib/network/feedbackApis";
import { fetchDocumentById as fetchSingleDocumentById } from "../../../lib/network/documentApis";
import { downloadModuleFile, fetchModuleById as fetchSingleModuleById } from "../../../lib/network/moduleApi";

interface FormErrorType {
  [key: string]: string;
}

// TypeScript interfaces for attachment data structure
interface AttachmentFile {
  id: number;
  filePath: string;
  version: number;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

interface AttachmentDocument {
  id: number;
  name: string;
  description: string;
  status: string;
  createdBy: string;
  createdDate: string;
  updatedDate: string | null;
  files: AttachmentFile[];
  // Optional links associated with a document
  links?: Array<{
    id: number;
    title: string;
    url: string;
    description?: string | null;
  }>;
  securityType: {
    id: number;
    name: string;
    description: string | null;
  };
}

interface AttachmentModule {
  id: number;
  name: string;
  description: string;
  Documents: AttachmentDocument[];
  trainingName: string;
  trainingId: number;
}

// Enhanced Description Component with better styling and smaller sizes
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

// Enhanced Modules Component with improved layout, animations, and smaller sizes
const ModulesSection = ({ trainings }: { trainings: any[] }) => {
  // Extract all modules from all trainings
  const allModules =
    trainings?.flatMap(
      (training) =>
        training.Modules?.map((module: any) => ({
          ...module,
          trainingName: training.trainingName,
          trainingId: training.id,
        })) || []
    ) || [];
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const [documentLinksMap, setDocumentLinksMap] = useState<Record<number, Array<{ id: number; title: string; url: string }>>>(
    {}
  );
  const [downloadingModuleFileId, setDownloadingModuleFileId] = useState<number | null>(null);
  const [moduleDocsMap, setModuleDocsMap] = useState<Record<number, any[]>>({});
  const [moduleFilesMap, setModuleFilesMap] = useState<Record<number, any[]>>({});

  // Load links for documents in the expanded module on demand
  useEffect(() => {
    if (expandedModule === null) return;
    const mod = allModules[expandedModule];
    if (!mod) return;

    // Load documents for module if missing
    const loadModuleDetails = async (moduleId: number) => {
      try {
        if (moduleDocsMap[moduleId] || moduleFilesMap[moduleId]) return;
        const action: any = await dispatch(
          fetchSingleModuleById({ id: String(moduleId) }) as any
        );
        const mData = action?.payload?.content?.data;
        const docs = (mData?.Documents as any[]) || [];
        const mFiles = (mData?.moduleFiles as any[]) || [];
        if (docs.length > 0) {
          setModuleDocsMap((prev) => ({ ...prev, [moduleId]: docs }));
        }
        if (mFiles.length > 0) {
          setModuleFilesMap((prev) => ({ ...prev, [moduleId]: mFiles }));
        }
      } catch {
        // ignore
      }
    };

    const loadLinks = async (docId: number) => {
      try {
        // Skip if already loaded
        if (documentLinksMap[docId]) return;
        const action: any = await dispatch(
          fetchSingleDocumentById({ id: String(docId) }) as any
        );
        const payload = action?.payload;
        const links = payload?.content?.data?.links as Array<{
          id: number;
          title: string;
          url: string;
        }> | undefined;
        if (Array.isArray(links) && links.length > 0) {
          setDocumentLinksMap((prev) => ({ ...prev, [docId]: links }));
        }
      } catch {
        // ignore link loading errors silently in UI
      }
    };

    // Ensure module docs/files are present
    const hasSomeDocs = Array.isArray((mod as any)?.Documents) && (mod as any).Documents.length > 0;
    const hasSomeFiles = Array.isArray((mod as any)?.moduleFiles) || Array.isArray((mod as any)?.ModuleFiles);
    if (!hasSomeDocs || !hasSomeFiles) {
      loadModuleDetails(Number(mod.id));
    }

    const docsForLinks: any[] = (mod as any)?.Documents && (mod as any).Documents.length > 0
      ? (mod as any).Documents
      : moduleDocsMap[Number(mod.id)] || [];

    docsForLinks.forEach((d: any) => {
      const hasLinksInPayload = Array.isArray(d?.links) && d.links.length > 0;
      if (!hasLinksInPayload) loadLinks(Number(d.id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedModule]);

  const handleDownloadModuleAttachment = async (
    moduleId: number,
    fileId: number,
    filePath: string,
    version: number
  ) => {
    try {
      setDownloadingModuleFileId(fileId);
      dispatch(startLoading());
      const blob = await downloadModuleFile(moduleId, fileId);
      const ext = (filePath?.split(".").pop() || "file").toString();
      const downloadFileName = `module-${moduleId}-v${version}.${ext}`;
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
        const { status, data } = (error as any).response || {};
        switch (status) {
          case 404:
            errorMessage = data?.message || "File not found.";
            break;
          case 403:
            errorMessage =
              "Access denied. You don't have permission to download this file.";
            break;
          case 400:
            errorMessage = data?.message || "Invalid request. Please try again.";
            break;
          case 500:
            errorMessage =
              "Server error. Please try again later or contact support.";
            break;
          default:
            errorMessage = data?.message || "Download failed. Please try again.";
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
      setDownloadingModuleFileId(null);
      dispatch(stopLoading());
    }
  };

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
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-base text-gray-900 mb-0.5 break-words break-all">
                        {mod.name || `Module ${index + 1}`}
                      </h4>
                      <p className="text-blue-600 text-xs font-medium mb-1 break-words break-all">
                        From:{" "}
                        <span className="break-words break-all">
                          {mod.trainingName}
                        </span>
                      </p>
                      {mod.description && (
                        <p className="text-gray-600 text-xs whitespace-pre-wrap break-words break-all">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mod?.Documents?.length > 0 && (
                      <Tag color="orange" className="text-xs">
                        {mod.Documents.length} Documents
                      </Tag>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform duration-300 ${
                        expandedModule === index ? "rotate-180" : ""
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
                      <p className="text-gray-700 text-xs leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  )}

                  {/* Module Attachments (files uploaded directly to module) */}
                  {(() => {
                    const moduleFilesList =
                      (mod as any)?.moduleFiles ||
                      (mod as any)?.ModuleFiles ||
                      (mod as any)?.module_files ||
                      moduleFilesMap[Number((mod as any)?.id)] ||
                      [];
                    const activeFiles = (moduleFilesList as any[]).filter(
                      (f: any) => !f?.status || f?.status === "active"
                    );
                    return Array.isArray(activeFiles) && activeFiles.length > 0 ? (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Module Attachments
                        </h5>
                        <div className="space-y-2">
                          {activeFiles.map((file: any) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-800 break-all">
                                    {file.filePath}
                                  </div>
                                  <div className="text-xxs text-gray-500">
                                    Version: {file.version} | Created: {new Date(file.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<Download className="w-3 h-3" />}
                                  loading={downloadingModuleFileId === file.id}
                                  onClick={() =>
                                    handleDownloadModuleAttachment(
                                      Number((mod as any)?.id),
                                      Number(file.id),
                                      String(file.filePath || "file"),
                                      Number(file.version || 1)
                                    )
                                  }
                                  className="text-xs px-2 py-1"
                                >
                                  Download
                                </Button>
                              </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Documents linked to this module (with their files and links) */}
                  {(Array.isArray((mod as any)?.Documents) && (mod as any).Documents.length > 0) ||
                  Array.isArray(moduleDocsMap[Number(mod.id)]) ? (
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Documents
                      </h5>
                      <div className="grid grid-cols-1 gap-3">
                        {((mod as any)?.Documents && (mod as any).Documents.length > 0
                          ? (mod as any).Documents
                          : moduleDocsMap[Number(mod.id)] || []
                        ).map((doc: any, docIndex: number) => {
                          // Debug logging
                          console.log(`Document ${docIndex}:`, doc);
                          console.log(`Document files:`, doc.files);
                          const activeFiles = doc.files?.filter((file: any) => file.status === "active" || !file.status) || [];
                          console.log(`Files to show (active or no status):`, activeFiles);
                          
                          return (
                          <div
                            key={docIndex}
                            className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow"
                          >
                            <div className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-1.5 break-words break-all">
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                              {doc.name}
                            </div>
                            {/* Links (if any) */}
                            {(Array.isArray(doc.links) && doc.links.length > 0) ||
                            Array.isArray(documentLinksMap[Number(doc.id)]) ? (
                              <div className="mb-2">
                                <div className="text-xs font-semibold text-gray-700 mb-1">Links</div>
                                <div className="space-y-1">
                                  {(doc.links || documentLinksMap[Number(doc.id)] || []).map((lnk: { id: number; title: string; url: string }) => (
                                    <div key={lnk.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded w-full">
                                      <div className="min-w-0 flex-1">
                                        <div className="text-xs text-gray-800 font-medium break-words" title={lnk.title}>
                                          {lnk.title}
                                        </div>
                                        <a
                                          href={lnk.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xxs text-blue-600 hover:underline break-all"
                                        >
                                          {lnk.url}
                                        </a>
                                      </div>
                                      <a
                                        href={lnk.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap"
                                      >
                                        Open
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                            {doc.files &&
                              doc.files.length > 0 &&
                              doc.files
                                .filter((file: any) => file.status === "active" || !file.status)
                                .map((file: any) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-1.5 last:mb-0"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs text-gray-700 truncate block">
                                        {file.filePath.split("/").pop()}
                                      </span>
                                      <span className="text-xxs text-gray-500">
                                        Version {file.version}
                                      </span>
                                    </div>
                                    <Button
                                      type="primary"
                                      size="small"
                                      icon={<Download className="w-4 h-4" />}
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
                                      className="ml-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 font-semibold"
                                    >
                                      Download
                                    </Button>
                                  </div>
                                ))}
                            {/* Show message if no active files */}
                            {doc.files &&
                              doc.files.length > 0 &&
                              doc.files.filter((file: any) => file.status === "active" || !file.status).length === 0 && (
                                <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded-md">
                                  No files available for download
                          </div>
                              )}
                            {/* Show message if no files at all */}
                            {(!doc.files || doc.files.length === 0) && (
                              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded-md">
                                No files available
                    </div>
                  )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
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

const AssessmentSection = ({ certification }: { certification: any }) => {
  // Derive total questions from multiple possible sources
  const derivedTotalQuestions = (() => {
    const fromArray = Array.isArray((certification as any)?.AssessmentQuestions)
      ? (certification as any).AssessmentQuestions.length
      : undefined;
    const fromField = typeof certification?.totalAssessmentQuestions === "number"
      ? certification.totalAssessmentQuestions
      : undefined;
    return fromArray ?? fromField ?? 0;
  })();

  const assessmentData = [
    {
      label: "Assessment Time",
      value: certification?.assessmentTime
        ? `${certification?.assessmentTime} Mins`
        : "N/A",
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      color: "blue",
    },
    {
      label: "Total Questions",
      value: derivedTotalQuestions,
      icon: <Target className="w-4 h-4 text-green-500" />,
      color: "green",
    },
    {
      label: "Pass Percentage",
      value: certification?.passPercentage
        ? `${certification?.passPercentage}%`
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
                    percent={certification?.passPercentage}
                    strokeColor="#f59e0b"
                    trailColor="#f3f4f6"
                    size="small"
                    showInfo={false} // Hide percentage text to keep it compact
                  />
                  <span className="text-xs text-gray-600 mt-1 block">
                    Target: {certification?.passPercentage}%
                  </span>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

const InstructorSection = ({
  instructors,
  trainer,
}: {
  instructors: any[];
  trainer: any;
}) => (
  <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
    <div className="flex items-center gap-2 mb-6">
      <div className="p-1.5 bg-indigo-50 rounded-md">
        <User className="w-4 h-4 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Course Instructor</h3>
    </div>

    <div className="space-y-4">
      {instructors.map((instructor, index) => (
        <div
          key={index}
          className="flex gap-4 items-start"
        >
          <img
            src="/images/default-profile-image.webp"
            alt={instructor.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />

          <div className="flex-1 py-1">
            <h4 className="text-base font-semibold text-gray-900">
              {`${trainer?.firstName || ""} ${trainer?.lastName || ""}`.trim() || "Instructor Name"}
            </h4>
            <p className="text-sm text-gray-600 mt-0.5">
              {instructor.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FeedbackSection = ({
  certification,
  user,
  isEnabled,
  alreadySubmitted,
  onSubmitted,
}: {
  certification: any;
  user: any;
  isEnabled: boolean;
  alreadySubmitted: boolean;
  onSubmitted?: () => void;
}) => {
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    feedbackText: "",
    recommendToOthers: null as boolean | null,
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(alreadySubmitted);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const dispatch = useAppDispatch();

  // Check if user has already submitted feedback (you can replace this with actual API call)
  useEffect(() => {
    setFeedbackSubmitted(alreadySubmitted);
  }, [alreadySubmitted]);

  // Hydrate previously saved rating/text from storage so it shows after navigation
  useEffect(() => {
    const storageKeyData = `feedbackData:${certification?.id}`;
    try {
      const raw = localStorage.getItem(storageKeyData);
      if (raw) {
        const saved = JSON.parse(raw) as {
          rating?: number;
          feedbackText?: string;
        };
        setFeedbackForm((prev) => ({
          ...prev,
          rating: typeof saved.rating === "number" ? saved.rating : prev.rating,
          feedbackText:
            typeof saved.feedbackText === "string"
              ? saved.feedbackText
              : prev.feedbackText,
        }));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [certification?.id]);

  // If feedback is disabled and not submitted, show info and exit
  if (!isEnabled && !feedbackSubmitted) {
    return (
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-yellow-50 rounded-md">
            <Star className="w-4 h-4 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Reviews & Feedback
          </h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Feedback locked
              </h4>
              <p className="text-xs text-blue-700">
                Feedback will be enabled after the trainer reviews your
                certification.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStarClick = (rating: number) => {
    setFeedbackForm((prev) => ({ ...prev, rating }));
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackForm.rating === 0) {
      setFeedbackError("Please provide a rating");
      return;
    }
    if (!feedbackForm.feedbackText.trim()) {
      setFeedbackError("Please provide your feedback");
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError("");

    try {
      const payload = {
        employeeId: Number(user?.employeeId),
        feedbackBy: "learner" as const,
        tenantId: Number(user?.tenentId?.id),
        certificateTransId: Number(certification?.id),
        rating: Number(feedbackForm.rating),
        feedbackText: feedbackForm.feedbackText.trim(),
      };

      const apiResponse = await createFeedbackApiFunction(payload);

      if (apiResponse && (apiResponse as any).code === 201) {
        setFeedbackSubmitted(true);
        setShowFeedbackForm(false);
        message.success(
          "Thank you for your feedback! It has been sent to the trainer."
        );
        // persist last submitted values for future visits
        try {
          localStorage.setItem(
            `feedbackData:${certification?.id}`,
            JSON.stringify({
              rating: feedbackForm.rating,
              feedbackText: feedbackForm.feedbackText,
            })
          );
          const newId = (apiResponse as any)?.content?.id;
          if (newId) {
            localStorage.setItem(
              `learnerFeedbackId:${certification?.id}`,
              String(newId)
            );
          }
        } catch (e) {
          // ignore storage errors
        }
        if (typeof onSubmitted === "function") onSubmitted();
      } else {
        message.success("Feedback submitted successfully.");
        setFeedbackSubmitted(true);
        setShowFeedbackForm(false);
        try {
          localStorage.setItem(
            `feedbackData:${certification?.id}`,
            JSON.stringify({
              rating: feedbackForm.rating,
              feedbackText: feedbackForm.feedbackText,
            })
          );
          const newId = (apiResponse as any)?.content?.id;
          if (newId) {
            localStorage.setItem(
              `learnerFeedbackId:${certification?.id}`,
              String(newId)
            );
          }
        } catch (e) {
          // ignore storage errors
        }
        if (typeof onSubmitted === "function") onSubmitted();
      }
    } catch (error: any) {
      setFeedbackError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const resetFeedbackForm = () => {
    setFeedbackForm({
      rating: 0,
      feedbackText: "",
      recommendToOthers: null,
    });
    setFeedbackError("");
    setShowFeedbackForm(false);
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-yellow-50 rounded-md">
          <Star className="w-4 h-4 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Reviews & Feedback</h3>
      </div>

      {feedbackSubmitted ? (
        // Thank you message after feedback submission
        <div className="text-center py-8">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-gray-800 mb-1.5">
            Thank You for Your Feedback!
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            Your feedback has been sent to the trainer and will help improve
            future courses.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-semibold text-gray-800">
                Your Rating: {feedbackForm.rating}/5
              </span>
            </div>
            <p className="text-sm text-gray-700 italic whitespace-pre-wrap break-words break-all max-h-48 overflow-y-auto">
              "{feedbackForm.feedbackText}"
            </p>
          </div>
        </div>
      ) : showFeedbackForm ? (
        // Feedback form
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Share Your Experience
            </h4>

            {/* Rating Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rate this certification course *
              </label>
              <div className="flex items-center gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="p-1 hover:scale-110 transition-transform duration-200"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= feedbackForm.rating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {feedbackForm.rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {feedbackForm.rating === 1 && "Poor"}
                  {feedbackForm.rating === 2 && "Fair"}
                  {feedbackForm.rating === 3 && "Good"}
                  {feedbackForm.rating === 4 && "Very Good"}
                  {feedbackForm.rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Share your detailed feedback *
              </label>
              <textarea
                value={feedbackForm.feedbackText}
                onChange={(e) =>
                  setFeedbackForm((prev) => ({
                    ...prev,
                    feedbackText: e.target.value,
                  }))
                }
                placeholder="Tell us about your learning experience, what you liked, and what could be improved..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                rows={4}
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {feedbackForm.feedbackText.length}/1000 characters
              </div>
            </div>

            {/* Recommendation */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Would you recommend this course to others? *
              </label>
              <div className="flex items-center gap-6 justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setFeedbackForm((prev) => ({
                      ...prev,
                      recommendToOthers: true,
                    }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 ${
                    feedbackForm.recommendToOthers === true
                      ? "bg-green-100 border-green-300 text-green-800"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-green-50"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Yes, I'd recommend it
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFeedbackForm((prev) => ({
                      ...prev,
                      recommendToOthers: false,
                    }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 ${
                    feedbackForm.recommendToOthers === false
                      ? "bg-red-100 border-red-300 text-red-800"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-red-50"
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  No, I wouldn't recommend it
                </button>
              </div>
            </div>

            {/* Error Message */}
            {feedbackError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm font-medium">
                  {feedbackError}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 justify-center">
              <Button
                onClick={resetFeedbackForm}
                className="px-6 py-2 text-sm"
                disabled={isSubmittingFeedback}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={isSubmittingFeedback}
                onClick={handleFeedbackSubmit}
                className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Directly show the feedback form (no button)
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Share Your Experience
            </h4>

            {/* Rating Section */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rate this certification course *
              </label>
              <div className="flex items-center gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="p-1 hover:scale-110 transition-transform duration-200"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= feedbackForm.rating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {feedbackForm.rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {feedbackForm.rating === 1 && "Poor"}
                  {feedbackForm.rating === 2 && "Fair"}
                  {feedbackForm.rating === 3 && "Good"}
                  {feedbackForm.rating === 4 && "Very Good"}
                  {feedbackForm.rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Share your detailed feedback *
              </label>
              <textarea
                value={feedbackForm.feedbackText}
                onChange={(e) =>
                  setFeedbackForm((prev) => ({
                    ...prev,
                    feedbackText: e.target.value,
                  }))
                }
                placeholder="Tell us about your learning experience, what you liked, and what could be improved..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                rows={4}
                maxLength={1000}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {feedbackForm.feedbackText.length}/1000 characters
              </div>
            </div>

            {/* Error Message */}
            {feedbackError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm font-medium">
                  {feedbackError}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 justify-center">
              {/* <Button
                  onClick={resetFeedbackForm}
                  className="px-6 py-2 text-sm"
                  disabled={isSubmittingFeedback}
                >
                  Cancel
                </Button> */}
              <Button
                type="primary"
                loading={isSubmittingFeedback}
                onClick={handleFeedbackSubmit}
                className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700"
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AttachmentsSection = ({ trainings }: { trainings: any[] }) => {
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [downloadingModuleFileId, setDownloadingModuleFileId] = useState<number | null>(null);
  const dispatch = useAppDispatch();

  // Extract document attachments
  const documentAttachments = useMemo(() => {
    const items: Array<{
      file: any;
      document: any;
      module: any;
    }> = [];
    trainings?.forEach((training) => {
      training.Modules?.forEach((module: any) => {
        module.Documents?.forEach((doc: any) => {
          (doc.files || [])
            .filter((f: any) => f.status === "active" || !f.status)
            .forEach((file: any) =>
              items.push({
                file,
                document: doc,
                module: { ...module, trainingName: training.trainingName, trainingId: training.id },
              })
            );
        });
      });
    });
    return items;
  }, [trainings]);

  // Extract module attachments
  const moduleAttachments = useMemo(() => {
    const items: Array<{
      file: any;
      module: any;
    }> = [];
    trainings?.forEach((training) => {
      training.Modules?.forEach((module: any) => {
        const moduleFilesFallback =
          module?.moduleFiles || module?.ModuleFiles || module?.module_files || [];
        (moduleFilesFallback as any[])
          .filter((f: any) => !f.status || f.status === "active")
          .forEach((file: any) =>
            items.push({ file, module: { ...module, trainingName: training.trainingName, trainingId: training.id } })
          );
      });
    });
    return items;
  }, [trainings]);

  const downloadDocumentFile = async (docId: number, fileId: number, filePath: string, version: number) => {
    try {
      setDownloadingFile(fileId);
      dispatch(startLoading());
      const blob = await downloadDocumentAttachment(docId, fileId);
      const ext = filePath.split(".").pop() || "file";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-${docId}-v${version}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("File downloaded successfully!");
    } finally {
      setDownloadingFile(null);
      dispatch(stopLoading());
    }
  };

  const downloadModuleFileHandler = async (moduleId: number, fileId: number, filePath: string, version: number) => {
    try {
      setDownloadingModuleFileId(fileId);
      dispatch(startLoading());
      const blob = await downloadModuleFile(moduleId, fileId);
      const ext = filePath.split(".").pop() || "file";
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `module-${moduleId}-v${version}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("File downloaded successfully!");
    } finally {
      setDownloadingModuleFileId(null);
      dispatch(stopLoading());
    }
  };

  const hasAny = documentAttachments.length > 0 || moduleAttachments.length > 0;

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-purple-50 rounded-md">
          <Paperclip className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Course Attachments</h3>
        <div className="ml-auto">
          <Tag color="purple" className="text-xs px-2 py-0.5">
            {documentAttachments.length + moduleAttachments.length} Files
          </Tag>
        </div>
      </div>

      {hasAny ? (
        <div className="space-y-6">
          {moduleAttachments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Module Attachments</h4>
              <div className="space-y-2">
                {moduleAttachments.map((att, idx) => (
                  <div key={`mf-${att.file.id}-${idx}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 break-all">{att.file.filePath}</div>
                      <div className="text-xxs text-gray-500">Version: {att.file.version} | Created: {new Date(att.file.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<Download className="w-3 h-3" />}
                      loading={downloadingModuleFileId === att.file.id}
                      onClick={() =>
                        downloadModuleFileHandler(Number(att.module.id), Number(att.file.id), String(att.file.filePath || 'file'), Number(att.file.version || 1))
                      }
                      className="text-xs px-2 py-1"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documentAttachments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Document Attachments</h4>
              <div className="space-y-2">
                {documentAttachments.map((att, idx) => (
                  <div key={`df-${att.file.id}-${idx}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 break-all">{att.file.filePath}</div>
                      <div className="text-xxs text-gray-500">Version: {att.file.version} | Created: {new Date(att.file.createdAt).toLocaleDateString()}</div>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<Download className="w-3 h-3" />}
                      loading={downloadingFile === att.file.id}
                      onClick={() =>
                        downloadDocumentFile(Number(att.document.id), Number(att.file.id), String(att.file.filePath || 'file'), Number(att.file.version || 1))
                      }
                      className="text-xs px-2 py-1"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No attachments available for this certification.</p>
        </div>
      )}
    </div>
  );
};

const TrainerFeedbackSection = ({
  feedbacks,
}: {
  feedbacks: Array<{
    reviewer: string;
    rating: number; // 0-5
    message: string;
    date?: string;
  }>;
}) => {
  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-indigo-50 rounded-md">
          <MessageCircle className="w-4 h-4 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Trainer Feedback</h3>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No trainer feedback available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src="/images/default-profile-image.webp"
                      alt={item.reviewer}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {item.reviewer}
                      </div>
                      {item.date && (
                        <div className="text-xxs text-gray-500">
                          {item.date}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words break-all max-h-48 overflow-y-auto">
                    {item.message}
                  </p>
                </div>
                <div
                  className="flex items-center gap-0.5 ml-3"
                  aria-label={`Rating ${item.rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= item.rating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
      isActive
        ? "bg-blue-600 text-white shadow-md transform scale-100" // Reduced scale for subtler effect
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Assigned":
      case "Re-assigned":
        return {
          color: "blue",
          text: "Ready to Start",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case "Completed":
        return {
          color: "green",
          text: "Completed",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
        };
      case "In Progress":
        return {
          color: "orange",
          text: "In Progress",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      default:
        return { color: "gray", text: status, icon: null };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800`}
    >
      {config.icon}
      {config.text}
    </div>
  );
};

const EmployeeCertificationTransactionDetails = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, tenentId } = useLocalStorageUserData();
  const [searchParams] = useSearchParams();
  const certificateTransactionId = searchParams.get(
    "certificationTransactionId"
  );

  const {
    data: certificationData,
    loading,
    error,
  } = useSelector((state: RootState) => state.certificationTransactionById);
  const { trainerFeedbackById } = useSelector(
    (state: RootState) => (state as any).feedback
  );

  // Extract the actual certification data from the new response structure
  const certification = certificationData;

  const [activeTab, setActiveTab] = useState("overview");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmModelOpen, setConfirmModelOpen] = useState(false);
  const [completeCertificationModalOpen, setCompleteCertificationModalOpen] =
    useState(false);
  const [showAllAttachments, setShowAllAttachments] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrorType>({});
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);
  const [fullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const fullscreenRequestedRef = useRef(false);
  const [feedbackGivenLocal, setFeedbackGivenLocal] = useState<boolean>(
    Boolean(certification?.feedbackGiven)
  );

  useEffect(() => {
    const storageKey = `feedbackGiven:${certificateTransactionId}`;
    try {
      if (localStorage.getItem(storageKey) === "true") {
        setFeedbackGivenLocal(true);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [certificateTransactionId]);

  useEffect(() => {
    if (certificateTransactionId) {
      dispatch(
        fetchCertificationTransactionByIdApiFunction({
          certificateTransactionId,
        })
      );
    }
  }, [dispatch, certificateTransactionId]);

  // Fetch trainer feedback by id if provided in the URL
  useEffect(() => {
    let trainerFeedbackId = searchParams.get("trainerFeedbackId");
    if (!trainerFeedbackId && certificateTransactionId) {
      try {
        const stored = localStorage.getItem(
          `trainerFeedbackId:${certificateTransactionId}`
        );
        if (stored) trainerFeedbackId = stored;
      } catch {}
    }
    if (trainerFeedbackId && tenentId) {
      dispatch(
        fetchTrainerFeedbackById({
          feedbackId: trainerFeedbackId,
          tenantId: tenentId,
        })
      );
    } else if (certificateTransactionId && tenentId) {
      // fallback: fetch by certificate transaction id to ensure certification-wise linking
      dispatch(
        fetchTrainerFeedbackByCertTransId({
          certTransId: certificateTransactionId,
          tenantId: tenentId,
        })
      );
    }
  }, [dispatch, searchParams, tenentId, certificateTransactionId]);

  // Create tabs dynamically based on available data
  const tabs = useMemo(() => {
    const isFeedbackRequired = Boolean(
      (certification?.Certification as any)?.isFeedbackRequired === true
    );
    const statusValue = (certification?.status || "").toString().toLowerCase();
    const shouldShowFeedbackTabs =
      isFeedbackRequired ||
      statusValue === "completed" ||
      statusValue === "rejected" ||
      statusValue === "cancelled";
    
    // Check if there are any attachments available
    const hasAttachments = (certification?.Certification as any)?.trainings?.some(
      (training: any) => 
        training.Modules?.some((module: any) => 
          module.Documents?.some((doc: any) => 
            doc.files?.some((file: any) => file.status === "active")
          )
        )
    );

    const allTabs = [
      {
        key: "overview",
        label: "Overview",
        icon: <FileText className="w-4 h-4" />,
        show: true, // Always show overview
      },
      {
        key: "modules",
        label: "Training",
        icon: <BookOpen className="w-4 h-4" />,
        show:
          (certification?.Certification as any)?.trainings &&
          (certification?.Certification as any)?.trainings.length > 0,
      },
      {
        key: "assessment",
        label: "Assessment",
        icon: <Target className="w-4 h-4" />,
        show:
          (certification?.Certification as any)?.isAssessmentRequired === true ||
          (((certification?.Certification as any)?.AssessmentQuestions &&
            (certification?.Certification as any)?.AssessmentQuestions.length > 0) ||
           ((certification as any)?.AssessmentQuestions &&
            (certification as any)?.AssessmentQuestions.length > 0)),
      },
      {
        key: "instructor",
        label: "Instructor",
        icon: <User className="w-4 h-4" />,
        show: true, // Always show instructor
      },

      {
        key: "Feedback",
        label: "Send Feedback",
        icon: <Send className="w-4 h-4" />,
        show: shouldShowFeedbackTabs,
      },
      {
        key: "Trainer Feedback",
        label: " Trainer Feedback",
        icon: <MessageCircle className="w-4 h-4" />,
        show: shouldShowFeedbackTabs,
      },
    ];
    return allTabs.filter((tab) => tab.show);
  }, [certification]);

  // Ensure activeTab is valid when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [tabs, activeTab]);

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
  //           Please wait while we fetch your certification details.
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

  // Dummy instructor data for display purposes
  const instructors = [
    {
      name: "Vako Shvili",
      title: "Web Designer & Best-Selling Instructor",
      rating: "4.9",
      students: "235,568",
      modules: "09",
      description:
        "One day Vako had enough with the 9-to-5 grind, or more like 9-to-9 in his case, and quit his job...",
      image: "/path-to-vako-image.jpg",
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
            {/* Only show modules section if trainings exist */}
            {(certification?.Certification as any)?.trainings &&
              (certification?.Certification as any)?.trainings.length > 0 && (
                <ModulesSection
                  trainings={
                    (certification?.Certification as any)?.trainings || []
                  }
                />
              )}
            {/* Attachments hidden in overview per requirements */}
            {/* Only show assessment section if assessment is required or questions exist */}
            {((certification?.Certification as any)?.isAssessmentRequired ===
              true ||
              ((certification?.Certification as any)?.AssessmentQuestions &&
                (certification?.Certification as any)?.AssessmentQuestions
                  .length > 0)) && (
              <AssessmentSection certification={certification?.Certification} />
            )}
            <InstructorSection
              instructors={instructors}
              trainer={certification?.trainer}
            />
          </>
        );
      case "modules":
        return (
          <>
            <div className="flex justify-end mb-3">
              <Button
                type="default"
                icon={<Paperclip className="w-4 h-4" />}
                onClick={() => setShowAllAttachments((prev) => !prev)}
              >
                {showAllAttachments ? "Hide attachments" : "See all attachments"}
              </Button>
            </div>
            {showAllAttachments ? (
              <AttachmentsSection
                trainings={(certification?.Certification as any)?.trainings || []}
              />
            ) : (
              <ModulesSection
                trainings={(certification?.Certification as any)?.trainings || []}
              />
            )}
          </>
        );
      // attachments tab removed; handled via button under modules
      case "assessment": {
        // Prefer questions from the transaction if present; otherwise fallback to Certification
        const assessmentSource =
          (certification as any) || certification?.Certification;
        return (
          <AssessmentSection certification={assessmentSource?.Certification || assessmentSource} />
        );
      }
      case "instructor":
        return (
          <InstructorSection
            instructors={instructors}
            trainer={certification?.trainer}
          />
        );
      case "Feedback": {
        const status = certification?.status;
        const normalizedStatus = (status || "").toString().toLowerCase();
        const alreadySubmitted = Boolean(
          certification?.feedbackGiven || feedbackGivenLocal
        );
        // Enable feedback only when certification is Completed, Rejected, or Cancelled
        // Locked during Assigned, Re-assigned, In Progress, and Under Review stages
        const isEnabled =
          normalizedStatus === "completed" ||
          normalizedStatus === "rejected" ||
          normalizedStatus === "cancelled";
        return (
          <FeedbackSection
            certification={certification}
            user={user}
            isEnabled={isEnabled}
            alreadySubmitted={alreadySubmitted}
            onSubmitted={() => {
              setFeedbackGivenLocal(true);
              try {
                localStorage.setItem(
                  `feedbackGiven:${certificateTransactionId}`,
                  "true"
                );
              } catch (e) {
                // ignore storage errors
              }
              if (certificateTransactionId) {
                dispatch(
                  fetchCertificationTransactionByIdApiFunction({
                    certificateTransactionId,
                  })
                );
              }
            }}
          />
        );
      }
      case "Trainer Feedback": {
        const feedbackArray = trainerFeedbackById
          ? [
              {
                reviewer:
                  `${trainerFeedbackById?.employee?.firstName || ""} ${
                    trainerFeedbackById?.employee?.lastName || ""
                  }`.trim() || "Trainer",
                rating: Number(trainerFeedbackById?.rating) || 0,
                message: trainerFeedbackById?.feedback || "", // <-- changed from feedbackText to feedback
                date: trainerFeedbackById?.createdAt
                  ? new Date(trainerFeedbackById.createdAt).toLocaleDateString()
                  : undefined,
              },
            ]
          : [];

        return <TrainerFeedbackSection feedbacks={feedbackArray} />;
      }
      default:
        return null;
    }
  };

  // Extract questionGroupId from multiple possible sources if available
  const questionGroupId = (() => {
    const candidates = [
      (certification as any)?.questionGroupId,
      (certification?.Certification as any)?.questionGroupId,
      (certification?.Certification as any)?.AssessmentQuestions?.[0]?.questionGroupId,
      (certification as any)?.AssessmentQuestions?.[0]?.questionGroupId,
    ];
    const valid = candidates.find(
      (v) => v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "null" && String(v) !== "undefined"
    );
    return valid ?? null;
  })();

  const handleSubmitConfirm = async () => {
    if (!certification?.documentReadStatus) {
      dispatch(startLoading());
      try {
        const formData = {
          companyId: user?.tenentId?.id,
          employeeId: user?.employeeId,
          certificationId: certification?.certificationId,
          documentReadStatus: true,
        };
        await updateCertificationTransactionApiFunction({
          formData,
          certificationTransactionId: certificateTransactionId,
        });
        setFullscreenModalOpen(true);
      } catch (error: any) {
        setIsErrorModelOpen(true);
        setErrors({
          apiError: error?.response?.data?.message || "Network Error",
        });
      } finally {
        dispatch(stopLoading());
      }
    } else {
      setFullscreenModalOpen(true);
    }
  };

  const handleCompleteCertification = async () => {
    dispatch(startLoading());
    try {
      await updateCertificationStatusResultApiFunction({
        certTransactionId: parseInt(certificateTransactionId || "0"),
        certificationResult: "Pass",
        status: "Completed",
      });

      // Close the modal and refresh the certification data
      setCompleteCertificationModalOpen(false);

      // Refresh the certification data to show updated status
      if (certificateTransactionId) {
        dispatch(
          fetchCertificationTransactionByIdApiFunction({
            certificateTransactionId,
          })
        );
      }

      message.success("Certification completed successfully!");
    } catch (error: any) {
      setIsErrorModelOpen(true);
      setErrors({
        apiError:
          error?.response?.data?.message ||
          "Failed to complete certification. Please try again.",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleDownloadCertificationPdf = async () => {
    console.log("=== STARTING PDF DOWNLOAD PROCESS ===");
    console.log("Certificate transaction ID:", certificateTransactionId);
    console.log("Tenant ID:", tenentId);
    console.log("Current certification:", certification);

    dispatch(startLoading());
    try {
      console.log("Calling API with:", {
        certTransactionId: certificateTransactionId,
        tenantId: tenentId,
      });

      const response = await downloadLearnerCertificationPdfApiFUnction({
        certTransactionId: certificateTransactionId || "",
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
      const hasAssessment =
        (certification?.Certification as any)?.isAssessmentRequired === true ||
        ((certification?.Certification as any)?.AssessmentQuestions &&
          (certification?.Certification as any)?.AssessmentQuestions.length >
            0);

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
      dispatch(stopLoading());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Breadcrumb path="Certifications" subPath="Certification Details" />

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          {" "}
          {/* Reduced padding and margin */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {" "}
            {/* Reduced gap */}
            <div className="flex items-start gap-4">
              {" "}
              {/* Reduced gap */}
              <BackButton />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {" "}
                  {/* Reduced gap and margin */}
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {/* Reduced font size */}
                    <span className="break-words break-all">
                      {certification?.Certification?.title}
                    </span>
                  </h1>
                  <StatusBadge status={certification?.status || "Unknown"} />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {" "}
                  {/* Reduced gap and margin */}
                  <div className="flex items-center gap-2">
                    {" "}
                    {/* Reduced gap */}
                    <img
                      src="/images/default-profile-image.webp"
                      alt="Instructor"
                      className="w-8 h-8 rounded-full object-cover border-1.5 border-gray-200"
                    />
                    <div>
                      <span className="text-gray-600 text-xs">Created by:</span>{" "}
                      {/* Reduced font size */}
                      <span className="text-gray-900 font-semibold ml-1.5 text-sm break-words break-all">
                        {" "}
                        {/* Reduced font size and margin */}
                        {`${certification?.trainer?.firstName || ""} ${
                          certification?.trainer?.lastName || ""
                        }`.trim() || "Instructor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {certification?.status !== "Assigned" &&
              certification?.status !== "Re-assigned" && (
                <div className="flex-shrink-0 flex gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
                  {/* Only show "View Your Submission" button if assessment was required */}
                  {((certification?.Certification as any)
                    ?.isAssessmentRequired === true ||
                    ((certification?.Certification as any)
                      ?.AssessmentQuestions &&
                      (certification?.Certification as any)?.AssessmentQuestions
                        .length > 0)) && (
                    <ButtonPrimary
                      text="View Your Submission"
                      onClick={() =>
                        navigate(
                          `/employee/certifications/view-user-assessment-answer?certTransactionId=${certification?.id}&employeeId=${certification?.employeeId}`
                        )
                      }
                      className="px-4 py-2 text-sm sm:px-5 sm:py-2.5"
                    />
                  )}
                  {certification?.certificationResult === "Pass" &&
                    certification?.status === "Completed" && (
                      <ButtonPrimary
                        text="Download Certificate"
                        onClick={handleDownloadCertificationPdf}
                        className="px-4 py-2 text-sm sm:px-5 sm:py-2.5 bg-green-600 hover:bg-green-700"
                      />
                    )}
                </div>
              )}
          </div>
        </div>
        <main>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex gap-1.5 overflow-x-auto flex-nowrap md:flex-wrap -mx-2 px-2">
              {" "}
              {/* Reduced gap */}
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

          {/* Content */}
          <div className="animate-fadeIn overflow-x-auto max-w-full">{renderContent()}</div>

          {/* Fixed Action Buttons - Show based on certification type */}
          {(certification?.status === "Assigned" ||
            certification?.status === "Re-assigned") && (
            <>
              {/* Assessment Button - Show when assessment is required */}
              {((certification?.Certification as any)?.isAssessmentRequired ===
                true ||
                ((certification?.Certification as any)?.AssessmentQuestions &&
                  (certification?.Certification as any)?.AssessmentQuestions
                    .length > 0)) && (
                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                  <Tooltip title="Click to start your certification assessment">
                    <button
                      onClick={() => setConfirmModelOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base font-semibold"
                    >
                      <Target className="w-4.5 h-4.5" />
                      Start Assessment
                    </button>
                  </Tooltip>
                </div>
              )}

              {/* Complete Certification Button - Show when no assessment but has trainings */}
              {((certification?.Certification as any)?.isAssessmentRequired ===
                false ||
                !(certification?.Certification as any)?.AssessmentQuestions ||
                (certification?.Certification as any)?.AssessmentQuestions
                  ?.length === 0) &&
                (certification?.Certification as any)?.trainings &&
                (certification?.Certification as any)?.trainings.length > 0 && (
                  <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                    <Tooltip title="Click to complete your certification after finishing all training modules">
                      <button
                        onClick={() => setCompleteCertificationModalOpen(true)}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base font-semibold"
                      >
                        <CheckCircle className="w-4.5 h-4.5" />
                        Complete Certification
                      </button>
                    </Tooltip>
                  </div>
                )}
            </>
          )}

          {/* Modals */}
          <SuccessModal
            isOpen={confirmModelOpen}
            title="Ready to Begin Assessment?"
            subtitle="Please confirm that you've read all the module documents before starting the assessment. Once started, you'll need to complete it in one session."
            onCancel={() => setConfirmModelOpen(false)}
            onClose={() => setConfirmModelOpen(false)}
            cancelText="Go Back"
            confirmText="Yes, I've Read Everything"
            onConfirm={handleSubmitConfirm}
          />

          <SuccessModal
            isOpen={fullscreenModalOpen}
            title="Assessment Fullscreen Mode"
            subtitle="The assessment will start in fullscreen mode. If you exit fullscreen or switch tabs, your assessment will be auto-submitted and closed. Please be prepared to complete the assessment in one sitting. Click 'Start Assessment' to continue."
            onCancel={() => setFullscreenModalOpen(false)}
            onClose={() => setFullscreenModalOpen(false)}
            cancelText="Go Back"
            confirmText="Start Assessment"
            onConfirm={async () => {
              if (!fullscreenRequestedRef.current) {
                fullscreenRequestedRef.current = true;
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                  await elem.requestFullscreen();
                } else if ((elem as any).webkitRequestFullscreen) {
                  await (elem as any).webkitRequestFullscreen();
                } else if ((elem as any).msRequestFullscreen) {
                  await (elem as any).msRequestFullscreen();
                }
              }
              {
                const baseUrl = `/employee/certifications/user-certifications-assessment`;
                const params = new URLSearchParams();
                if (certificateTransactionId) {
                  params.set(
                    "certificationTransactionId",
                    String(certificateTransactionId)
                  );
                }
                // Derive questionGroupId from multiple safe sources
                const candidates = [
                  (certification as any)?.questionGroupId,
                  (certification?.Certification as any)?.questionGroupId,
                  questionGroupId,
                  (certification?.Certification as any)?.AssessmentQuestions?.[0]?.questionGroupId,
                  (certification as any)?.AssessmentQuestions?.[0]?.questionGroupId,
                ];
                const effectiveQgid = candidates.find(
                  (v) => v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "null" && String(v) !== "undefined"
                );
                if (effectiveQgid) {
                  params.set("questionGroupId", String(effectiveQgid));
                } else if (certification?.certificationId) {
                  params.set(
                    "certificationId",
                    String(certification.certificationId)
                  );
                }
                navigate(`${baseUrl}?${params.toString()}`);
              }
            }}
          />

          <SuccessModal
            isOpen={completeCertificationModalOpen}
            title="Complete Certification"
            subtitle="Please confirm that you have read and completed all training modules for this certification. Once you confirm, the certification will be marked as completed"
            onCancel={() => setCompleteCertificationModalOpen(false)}
            onClose={() => setCompleteCertificationModalOpen(false)}
            cancelText="Go Back"
            confirmText="Yes, I Have Completed All Modules"
            onConfirm={handleCompleteCertification}
          />
        </main>
      </div>
    </div>
  );
};

export default EmployeeCertificationTransactionDetails;
