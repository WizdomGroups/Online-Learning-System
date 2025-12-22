import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import {
  BookOpen,
  Users,
  Calendar,
  User,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { fetchTrainingById, ApiError } from "../../lib/network/trainingApi";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ErrorMessage from "../../components/ErrorMessage";
import ErrorModal from "../../components/ErrorModal";
import { RootState } from "../../store";
import { Tag, Button, message } from "antd";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { downloadModuleFile } from "../../lib/network/moduleApi";

const TrainingDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [trainingDetailsError, setTrainingDetailsError] = useState("");
  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [downloadingModuleFileId, setDownloadingModuleFileId] = useState<number | null>(null);
  const [documentDownloadError, setDocumentDownloadError] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (id) {
      // Fetch training details when component mounts
      const fetchTrainingDetails = async () => {
        try {
          setLoading(true);
          setError("");
          dispatch(startLoading());

          const response = await fetchTrainingById(id);

          if (response && response.content && response.content.data) {
            setTraining(response.content.data);
          } else {
            setError("Training not found");
          }
        } catch (error) {
          console.error("Error fetching training details:", error);

          if (error instanceof Error) {
            if ("status" in error) {
              const apiError = error as ApiError;
              setError(apiError.message);
            } else {
              setError(error.message || "Failed to load training details");
            }
          } else {
            setError("Failed to load training details");
          }
        } finally {
          setLoading(false);
          dispatch(stopLoading());
        }
      };

      fetchTrainingDetails();
    }
  }, [dispatch, id]);

  // Download handler for document files
  const handleDownload = async (
    fileId: number,
    filePath: string,
    documentId: number,
    documentName: string
  ) => {
    try {
      setDownloadingFile(fileId);
      // Import and use the document download API
      const { downloadDocumentAttachment } = await import(
        "../../lib/network/documentApis"
      );
      const blob = await downloadDocumentAttachment(documentId, fileId);

      const url = window.URL.createObjectURL(blob);
      const ext = filePath.split(".").pop() || "file";
      const downloadFileName = `${documentName}.${ext}`;
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
            if (data?.message?.includes("File not found")) {
              errorMessage =
                "File not found on server. Please contact administrator.";
            } else {
              errorMessage = data?.message || "File not found.";
            }
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
      if (errorMessage === "Request failed with status code 404") {
        errorMessage = "File not found on server";
      }
      message.error(errorMessage);
      setDocumentDownloadError(errorMessage);
    } finally {
      setDownloadingFile(null);
    }
  };

  // Download handler for module attachments
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
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download file. Please try again.";
      message.error(msg);
      setDocumentDownloadError(msg);
    } finally {
      setDownloadingModuleFileId(null);
      dispatch(stopLoading());
    }
  };

  // Toggle module expansion
  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  if (loading) return <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base">Loading...</div>;
  if (error) return <ErrorMessage message={error} />;
  if (!training)
    return <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base">Training not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb path="Training" subPath="View Training" />

      <div className="container mx-auto py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-row items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
          <BackButton />
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 flex-1 min-w-0 truncate">
            <span className="block truncate">{training.trainingName}</span>
          </h1>
        </div>

        <main className="mt-2 sm:mt-3 md:mt-4 bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
              <div className="flex-shrink-0 bg-blue-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm w-full sm:w-auto flex justify-center sm:justify-start">
                <BookOpen size={48} className="sm:w-[56px] sm:h-[56px] md:w-[64px] md:h-[64px] text-blue-500" />
              </div>
              <div className="w-full sm:flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  <section>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                      Description
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <span className="block break-words whitespace-pre-wrap">{training.description}</span>
                    </p>
                  </section>

                  <section>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                      Training Code
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded break-all">
                      {training.trainingCode}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                      Status
                    </h3>
                    {training.status && (
                      <Tag
                        color={
                          training.status === "active"
                            ? "green"
                            : training.status === "inactive"
                            ? "gold"
                            : training.status === "Pending"
                            ? "purple"
                            : "gray"
                        }
                        className="text-xs px-2 sm:px-3 py-1 rounded-full capitalize"
                      >
                        {training.status}
                      </Tag>
                    )}
                  </section>

                  <section>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                      Company
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 break-words break-all">
                      {training.CompanyModel?.name || "N/A"}
                    </p>
                  </section>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 md:mt-6 space-y-3 sm:space-y-4">
              {/* Modules Section */}
              <section>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-800 mb-3 sm:mb-4">
                  Modules ({training.Modules?.length || 0})
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {training.Modules?.map((module: any) => (
                    <div
                      key={module.id}
                      className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div
                        className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-3 sm:gap-x-4 items-start sm:items-center cursor-pointer"
                        onClick={() => toggleModuleExpansion(module.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="min-w-0 flex-1 sm:flex-none">
                          <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                            Module Name:
                          </span>{" "}
                          <span className="text-gray-700 text-xs sm:text-sm break-words break-all block sm:inline">
                            {module.name}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                            Order:
                          </span>{" "}
                          <span className="text-gray-700 text-xs sm:text-sm">
                            {module.TrainingModule?.moduleOrder || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-start sm:justify-end">
                          <Tag
                            color={
                              module.status === "active" ? "green" : "gold"
                            }
                            className="text-xs px-2 py-0.5"
                          >
                            {module.status}
                          </Tag>
                        </div>
                        <div className="flex justify-start sm:justify-end">
                          <Button
                            type="text"
                            size="small"
                            icon={
                              expandedModules.has(module.id) ? (
                                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                              )
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModuleExpansion(module.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title={
                              expandedModules.has(module.id)
                                ? "Hide Details"
                                : "Show Details"
                            }
                          />
                        </div>
                      </div>
                      {/* Module Details - Only show when expanded */}
                      {expandedModules.has(module.id) && (
                        <>
                          {module.description && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-xs sm:text-sm text-gray-600">
                                <span className="block break-words whitespace-pre-wrap">{module.description}</span>
                              </p>
                            </div>
                          )}

                          {/* Documents Section */}
                          {module.Documents && module.Documents.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                Documents 
                              </h4>
                              <div className="space-y-2 sm:space-y-3">
                                {module.Documents.map((document: any) => (
                                  <div
                                    key={document.id}
                                    className="bg-gray-50 p-2 sm:p-3 rounded-lg"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                          <span className="block break-words break-all">{document.name}</span>
                                        </p>
                                        {document.description && (
                                          <p className="text-xs text-gray-600 mt-1">
                                            <span className="block break-words whitespace-pre-wrap">{document.description}</span>
                                          </p>
                                        )}
                                      </div>
                                      <Tag
                                        color={
                                          document.status === "active"
                                            ? "green"
                                            : "gold"
                                        }
                                        className="text-xs px-2 py-0.5 self-start sm:self-center"
                                      >
                                        {document.status}
                                      </Tag>
                                    </div>

                                    {/* Links (if any) */}
                                    {Array.isArray((document as any)?.links) && (document as any).links.length > 0 && (
                                      <div className="mb-2 sm:mb-3">
                                        <div className="text-xs font-semibold text-gray-700 mb-1">Links</div>
                                        <div className="space-y-1 sm:space-y-2">
                                          {(document as any).links.map((lnk: { id: number; title: string; url: string }) => (
                                            <div key={lnk.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-white border border-gray-100 rounded">
                                              <div className="min-w-0 flex-1">
                                                <div className="text-xs text-gray-800 truncate sm:max-w-[260px]" title={lnk.title}>
                                                  {lnk.title}
                                                </div>
                                                <a
                                                  href={lnk.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-blue-600 hover:underline break-all block mt-1"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  {lnk.url}
                                                </a>
                                              </div>
                                              <a
                                                href={lnk.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs px-2 sm:px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap self-start sm:self-center"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                Open
                                              </a>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Files */}
                                    {document.files &&
                                      document.files.length > 0 && (
                                        <div className="space-y-1 sm:space-y-2">
                                          {document.files.map((file: any) => (
                                            <div
                                              key={file.id}
                                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border p-2 rounded bg-white hover:shadow transition"
                                            >
                                              <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
                                                  {document.name}
                                                </div>
                                                <div className="text-xs text-gray-500 break-all mt-1">
                                                  File:{" "}
                                                  <span className="break-all">
                                                    {file.filePath
                                                      .split("/")
                                                      .pop() || file.filePath}
                                                  </span>
                                                </div>
                                              </div>
                                              <Button
                                                type="primary"
                                                size="small"
                                                icon={
                                                  <Download className="h-3 w-3 sm:w-4 sm:h-4" />
                                                }
                                                loading={
                                                  downloadingFile === file.id
                                                }
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownload(
                                                    file.id,
                                                    file.filePath,
                                                    document.id,
                                                    document.name
                                                  );
                                                }}
                                                className="w-full sm:w-auto text-xs sm:text-sm"
                                              >
                                                <span className="text-xs sm:text-sm">Download</span>
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Module Attachments Section */}
                          {(() => {
                            const moduleFiles =
                              (module as any)?.moduleFiles ||
                              (module as any)?.ModuleFiles ||
                              (module as any)?.module_files ||
                              [];
                            const activeFiles = (moduleFiles as any[]).filter(
                              (f: any) => !f?.status || f?.status === "active"
                            );
                            return activeFiles.length > 0 ? (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Module Attachments
                                </h4>
                                <div className="space-y-2">
                                  {activeFiles.map((file: any) => (
                                    <div
                                      key={file.id}
                                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border p-2 rounded bg-white hover:shadow transition"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-gray-800 text-xs sm:text-sm break-words">
                                          {file.filePath}
                                        </div>
                                        <div className="text-xs text-gray-500 break-all mt-1">
                                          Version: {file.version} | Created: {new Date(file.createdAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <Button
                                        type="primary"
                                        size="small"
                                        icon={<Download className="h-3 w-3 sm:w-4 sm:h-4" />}
                                        loading={downloadingModuleFileId === file.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadModuleAttachment(
                                            Number(module.id),
                                            Number(file.id),
                                            String(file.filePath || "file"),
                                            Number(file.version || 1)
                                          );
                                        }}
                                        className="w-full sm:w-auto text-xs sm:text-sm"
                                      >
                                        <span className="text-xs sm:text-sm">Download</span>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Training Details Error Modal */}
      <ErrorModal
        isOpen={!!trainingDetailsError}
        title="Error"
        subtitle={trainingDetailsError}
        onCancel={() => setTrainingDetailsError("")}
        onClose={() => setTrainingDetailsError("")}
      />

      {/* Document Download Error Modal */}
      <ErrorModal
        isOpen={!!documentDownloadError}
        title="Download Error"
        subtitle={documentDownloadError}
        onCancel={() => setDocumentDownloadError("")}
        onClose={() => setDocumentDownloadError("")}
      />
    </div>
  );
};

export default TrainingDetails;
