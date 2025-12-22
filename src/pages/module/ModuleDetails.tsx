import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import { FileText, Download } from "lucide-react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { RootState } from "../../store";
import { fetchModuleById } from "../../lib/network/moduleApi";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { Tag, Button, message } from "antd";
import { downloadModuleFile } from "../../lib/network/moduleApi";
import { Module } from "../../lib/types/module";
import ErrorModal from "../../components/ErrorModal";
import Tooltip from "../../components/Tooltip";

// Define ModuleFile type (if not exported from types)
interface ModuleFile {
  id: number;
  filePath: string;
  version: number;
  location: string;
  status: string;
  moduleId: number;
  createdAt: string;
  updatedAt: string | null;
}

const ModuleDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { moduleById, loading } = useSelector(
    (state: RootState) => state.module
  );
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [documentDownloadError, setDocumentDownloadError] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchModuleById({ id }));
    }
  }, [dispatch, id]);

  if (loading) return <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base">Loading...</div>;
  if (!moduleById?.content?.data) return <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base">Module not found</div>;

  const {
    name,
    description,
    assessment,
    feedback,
    allotedTimeMins,
    status,
    Documents,
    MasterCategoryModel,
    id: moduleId,
    moduleFiles,
  } = moduleById.content.data as Module & { moduleFiles?: ModuleFile[] };

  // Unified download handler for both module and document files
  const handleDownload = async (
    fileId: number,
    filePath: string,
    version: number,
    isModuleFile: boolean = true
  ) => {
    try {
      setDownloadingFile(fileId);
      // Use the correct download function
      let blob: Blob;
      if (isModuleFile) {
        blob = await downloadModuleFile(moduleId, fileId);
      } else {
        // For document files, find the documentId
        const doc = Documents?.find((d) =>
          d.files.some((f) => f.id === fileId)
        );
        if (!doc) throw new Error("Document not found for this file.");
        // Use the document download API (import if needed)
        const { downloadDocumentAttachment } = await import(
          "../../lib/network/documentApis"
        );
        blob = await downloadDocumentAttachment(doc.id, fileId);
      }
      const url = window.URL.createObjectURL(blob);
      const ext = filePath.split(".").pop() || "file";
      const downloadFileName = isModuleFile
        ? `module-${moduleId}-v${version}.${ext}`
        : `document-${fileId}.${ext}`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb path="Module" subPath="View Module" />
      <div className="container mx-auto py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-row items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
          <BackButton />
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 flex-1 min-w-0 truncate">
            <Tooltip text={name} maxLength={50} position="top">
              <span className="block truncate">{name}</span>
            </Tooltip>
          </h1>
        </div>

        <main className="mt-2 sm:mt-3 md:mt-4 bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
              <div className="flex-shrink-0 bg-orange-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm w-full sm:w-auto flex justify-center sm:justify-start">
                <FileText size={64} className="sm:w-[70px] sm:h-[70px] md:w-[98px] md:h-[98px] text-orange-500" />
              </div>
              <div className="w-full sm:flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                <section className="sm:col-span-2 lg:col-span-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                    Description
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <Tooltip text={description} maxLength={150} position="top">
                      <span className="block break-words whitespace-pre-wrap">
                        {description}
                      </span>
                    </Tooltip>
                  </p>
                </section>

                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                    Assessment
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">{assessment ? "Yes" : "No"}</p>
                </section>

                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                    Feedback
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">{feedback ? "Yes" : "No"}</p>
                </section>

                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                    Time Allotted
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">{allotedTimeMins} minutes</p>
                </section>

                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">Status</h3>
                  <Tag
                    color={
                      status === "active"
                        ? "green"
                        : status === "inactive"
                        ? "gold"
                        : status === "Pending"
                        ? "purple"
                        : "gray"
                    }
                    className="text-xs px-2 sm:px-3 py-1 rounded-full capitalize shadow-sm"
                  >
                    {status}
                  </Tag>
                </section>

                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">Category</h3>
                  <Tag
                    color={
                      MasterCategoryModel?.name === "General"
                        ? "green"
                        : MasterCategoryModel?.name === "Specific"
                        ? "purple"
                        : MasterCategoryModel?.name === "Mandatory"
                        ? "gold"
                        : "gray"
                    }
                    className="text-xs px-2 sm:px-3 py-1 rounded-full capitalize shadow-sm"
                  >
                    {MasterCategoryModel?.name}
                  </Tag>
                </section>
              </div>
            </div>

            {/* Content */}
            <div className="mt-4 sm:mt-5 md:mt-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Assessment Info */}
              {/* Removed duplicated info cards to match Document Details layout */}

              {/* Documents */}
              {Documents?.length > 0 && (
                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-5">
                    Documents
                  </h3>
                  <div className="grid gap-3 sm:gap-4">
                    {Documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-gray-200 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                              <span className="block break-words break-all">
                                {doc.name}
                              </span>
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              <span className="block break-words break-all whitespace-pre-wrap">
                                {doc.description}
                              </span>
                            </p>
                          </div>
                          <Tag
                            color={doc.status === "active" ? "green" : "red"}
                            className="self-start sm:self-center text-xs px-2 py-0.5"
                          >
                            {doc.status}
                          </Tag>
                        </div>
                        {/* Files */}
                        <div className="space-y-2 sm:space-y-3">
                          {doc.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border p-2 sm:p-3 rounded-lg bg-white hover:shadow transition"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs sm:text-sm break-all">
                                  {file.filePath}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Version: {file.version} | Created:{" "}
                                  {new Date(
                                    file.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <Button
                                type="primary"
                                size="small"
                                icon={<Download className="w-3 h-3 sm:w-4 sm:h-4" />}
                                loading={downloadingFile === file.id}
                                onClick={() =>
                                  handleDownload(
                                    file.id,
                                    file.filePath,
                                    file.version,
                                    false // isModuleFile = false for document files
                                  )
                                }
                                className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
                              >
                                <span className="text-xs sm:text-sm">Download</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Module Attachments */}
              {Array.isArray(moduleFiles) &&
                moduleFiles.filter((f) => f.status === "active").length > 0 && (
                  <section>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-5">
                      Module Attachments
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {moduleFiles
                        .filter((f) => f.status === "active")
                        .map((file) => (
                          <div
                            key={file.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border p-2 sm:p-3 rounded-lg bg-white hover:shadow transition"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs sm:text-sm break-all">
                                {file.filePath}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Version: {file.version} | Created:{" "}
                                {new Date(file.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Button
                              type="primary"
                              size="small"
                              icon={<Download className="w-3 h-3 sm:w-4 sm:h-4" />}
                              loading={downloadingFile === file.id}
                              onClick={() =>
                                handleDownload(
                                  file.id,
                                  file.filePath,
                                  file.version,
                                  true // isModuleFile = true for module files
                                )
                              }
                              className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
                            >
                              <span className="text-xs sm:text-sm">Download</span>
                            </Button>
                          </div>
                        ))}
                    </div>
                  </section>
                )}
            </div>
          </div>
        </main>
      </div>

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

export default ModuleDetails;
