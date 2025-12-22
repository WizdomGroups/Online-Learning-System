import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import { FileText, Download } from "lucide-react";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import {
  fetchDocumentById,
  downloadDocumentAttachment,
} from "../../lib/network/documentApis";
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
import Tooltip from "../../components/Tooltip";

const DocumentDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [documentDownloadError, setDocumentDownloadError] = useState("");

  const {
    data: documentData,
    loading,
    error,
  } = useSelector((state: RootState) => state.documentById);

  useEffect(() => {
    if (id) {
      dispatch(fetchDocumentById({ id }));
    }
  }, [dispatch, id]);

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      setDownloadingFile(fileId);
      dispatch(startLoading());

      // Call the document attachment download API using the new function
      const response = await downloadDocumentAttachment(id!, fileId);

      console.log("Download response:", response);
      console.log("Response type:", typeof response);
      console.log("Response instanceof Blob:", response instanceof Blob);

      // Create download link
      const url = window.URL.createObjectURL(response);
      const link = window.document.createElement("a");
      link.href = url;

      // Extract file extension from filePath
      const fileExtension = fileName.split(".").pop() || "";
      const downloadFileName = `document-${fileId}.${fileExtension}`;

      link.setAttribute("download", downloadFileName);
      window.document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("File downloaded successfully!");
    } catch (error: unknown) {
      console.error("Download error:", error);

      // Handle different error scenarios based on backend response
      let errorMessage = "Failed to download file. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const { status, data } = (
          error as { response: { status: number; data?: { message?: string } } }
        ).response;

        switch (status) {
          case 404:
            if (data?.message?.includes("Document not found")) {
              errorMessage = "Document not found. Please refresh the page.";
            } else if (data?.message?.includes("File not found")) {
              errorMessage =
                "File not found on server. Please contact administrator.";
            } else if (data?.message?.includes("No files found")) {
              errorMessage = "No files available for this document.";
            } else if (data?.message?.includes("No active files")) {
              errorMessage = "No active files available for download.";
            } else {
              errorMessage = data?.message || "File not found.";
            }
            break;

          case 403:
            errorMessage =
              "Access denied. You don't have permission to download this file.";
            break;

          case 400:
            if (data?.message?.includes("Empty file")) {
              errorMessage = "File is empty and cannot be downloaded.";
            } else {
              errorMessage =
                data?.message || "Invalid request. Please try again.";
            }
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
        // Network error
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else {
        // Other errors
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
      dispatch(stopLoading());
    }
  };

  const document = documentData?.content?.data;

  if (loading) return <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base">Loading...</div>;
  if (error) return <ErrorMessage message={error} />;
  if (!document)
    return <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base">Document not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb path="Document" subPath="View Document" />

      <div className="container mx-auto py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-row items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
          <BackButton />
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 flex-1 min-w-0 truncate">
            <Tooltip text={document.name} maxLength={50} position="top">
              <span className="block truncate">
                {document.name}
              </span>
            </Tooltip>
          </h1>
        </div>

        <main className="mt-2 sm:mt-3 md:mt-4 bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
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
                    <Tooltip text={document.description} maxLength={150} position="top">
                      <span className="block break-words whitespace-pre-wrap">
                        {document.description}
                      </span>
                    </Tooltip>
                  </p>
                </section>

                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                    Status
                  </h3>
                  {document.status && (
                    <Tag
                      color={
                        document.status === "active"
                          ? "green"
                          : document.status === "inactive"
                          ? "gold"
                          : document.status === "Pending"
                          ? "purple"
                          : "gray"
                      }
                      className="text-xs px-2 sm:px-3 py-1 rounded-full capitalize shadow-sm"
                    >
                      {document.status}
                    </Tag>
                  )}
                </section>

                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                    Security Type
                  </h3>
                  {document.securityType?.name && (
                    <Tag
                      color={
                        document.securityType.name === "High"
                          ? "red"
                          : document.securityType.name === "Medium"
                          ? "orange"
                          : document.securityType.name === "Low"
                          ? "blue"
                          : "default"
                      }
                      className="text-xs px-2 sm:px-3 py-1 rounded-full capitalize shadow-sm"
                    >
                      {document.securityType.name}
                    </Tag>
                  )}
                </section>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 md:mt-6 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Files section: only show if files exist */}
              {Array.isArray(document.files) && document.files.length > 0 && (
                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-5">
                    Files
                  </h3>
                  <div className="space-y-3 sm:space-y-4 md:space-y-5">
                    {document.files.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                              <span className="font-medium text-gray-800 text-xs sm:text-sm">
                                Version:
                              </span>{" "}
                              <span className="text-gray-700 text-xs sm:text-sm">
                                {file.version}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-gray-800 text-xs sm:text-sm">
                                Created:
                              </span>{" "}
                              <span className="text-gray-700 text-xs sm:text-sm">
                                {new Date(file.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-1">
                              <span className="font-medium text-gray-800 text-xs sm:text-sm">
                                Path:
                              </span>{" "}
                              <span className="text-gray-700 break-all text-xs sm:text-sm">
                                {file.filePath}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-start sm:justify-end pt-2 border-t border-gray-100 sm:border-t-0 sm:pt-0">
                            <Button
                              type="primary"
                              icon={<Download className="w-3 h-3 sm:w-4 sm:h-4" />}
                              loading={downloadingFile === file.id}
                              onClick={() =>
                                handleDownload(file.id, file.filePath)
                              }
                              className="flex items-center gap-2 w-full sm:w-auto"
                              size="small"
                            >
                              <span className="text-xs sm:text-sm">Download</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Links section: show only Title and URL */}
              {Array.isArray(document.links) && document.links.length > 0 && (
                <section>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-5">
                    Links
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {document.links.map(
                      (link: { id: number; title: string; url: string }) => (
                        <div
                          key={link.id}
                          className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
                            <div className="text-xs sm:text-sm font-medium text-gray-800">
                              <Tooltip
                                text={link.title}
                                maxLength={30}
                                position="top"
                              >
                                <span className="break-words cursor-pointer block">
                                  {link.title}
                                </span>
                              </Tooltip>
                            </div>
                            <div className="text-xs sm:text-sm">
                              <Tooltip
                                text={link.url}
                                maxLength={50}
                                position="top"
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all block"
                                >
                                  {link.url}
                                </a>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      )
                    )}
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

export default DocumentDetails;
