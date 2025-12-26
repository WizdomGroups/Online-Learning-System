import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FileText, Download, Eye, X, Trash } from "lucide-react";
import { Tag, Button, message } from "antd";
import Tooltip from "../../components/Tooltip";

import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import TextAreaField from "../../components/TextAreaField";
import SelectField from "../../components/SelectField";

import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSecondary from "../../components/ButtonSecondary";
import SuccessModal from "../../components/SuccessModel";
import ErrorModal from "../../components/ErrorModal";
import ErrorMessage from "../../components/ErrorMessage";

import { RootState } from "../../store";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { SecurityList, StatusList } from "../../lib/constants";
import {
  createDocumentValidationSchema,
  editDocumentValidationSchema,
} from "../../lib/ValidationsSchema";
import {
  createDocumentApiFunction,
  updateDocumentApiFunction,
  fetchDocumentById,
  downloadDocumentAttachment,
} from "../../lib/network/documentApis";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import LocalStorageStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import { Company } from "../../lib/interface/company";

interface DocumentFile {
  id: number;
  filePath: string;
  version: number;
  location: string;
  status: string;
  documentId: number;
  createdAt: string;
  updatedAt: string | null;
}

interface DocumentLinkExisting {
  id: number;
  title: string;
  url: string;
  linkType?: "external" | "internal" | "video" | "document" | "resource";
  displayOrder?: number | null;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

interface DocumentLinkNew {
  title: string;
  url: string;
  linkType?: "external" | "internal" | "video" | "document" | "resource";
  displayOrder?: number | null;
  isPublic?: boolean;
}

interface FormDataType {
  name: string;
  description: string;
  status: string;
  securityTypeId: string;
  documentFiles: File[];
  tenantId?: string; // added for super admin
  documentLinks?: DocumentLinkNew[];
  deleteLinkIds?: number[];
}

interface FormErrorType {
  [key: string]: string;
}

const initialState: FormDataType = {
  name: "",
  description: "",
  status: "",
  securityTypeId: "",
  documentFiles: [],
  tenantId: "",
  documentLinks: [],
  deleteLinkIds: [],
};

const CreateUpdateDocuments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tenentId, isSuperAdmin } = LocalStorageStorageUserData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const location = useLocation();
  const rolePrefix = location.pathname.split("/")[1]; // e.g., 'super-admin', 'admin', 'trainer'

  const {
    data: documentData,
    loading,
    error,
  } = useSelector((state: RootState) => state.documentById);
  // Removed unused 'companies' variable

  const [formData, setFormData] = useState<FormDataType>(initialState);
  const [errors, setErrors] = useState<FormErrorType>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);
  const [existingFiles, setExistingFiles] = useState<DocumentFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [isViewMode] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);

  const [companyOptions, setCompanyOptions] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  const [existingLinks, setExistingLinks] = useState<DocumentLinkExisting[]>(
    []
  );
  const [linksToDelete, setLinksToDelete] = useState<number[]>([]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChangeFiles = (files: FileList | null) => {
    if (!files) {
      setFormData((prev) => ({ ...prev, documentFiles: [] }));
      setErrors((prev) => ({ ...prev, documentFiles: "" }));
      return;
    }

    const fileArray = Array.from(files);
    console.log("[DEBUG] Selected files in handleChangeFiles:", fileArray);

    // Validate file count (max 10 files)
    if (fileArray.length > 10) {
      setErrors((prev) => ({
        ...prev,
        documentFiles: "Maximum 10 files allowed",
      }));
      return;
    }

    // Validate each file size (max 1MB per file)
    const invalidFiles = fileArray.filter(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        documentFiles: `Files must be less than 5MB each. Invalid files: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, documentFiles: fileArray }));
    setErrors((prev) => ({ ...prev, documentFiles: "" }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documentFiles: prev.documentFiles.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({ ...prev, documentFiles: "" }));
  };

  const handleFileDelete = (fileId: number) => {
    setFilesToDelete((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleExistingLinkDelete = (linkId: number) => {
    setLinksToDelete((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  const handleAddNewLink = () => {
    setFormData((prev) => ({
      ...prev,
      documentLinks: [...(prev.documentLinks || []), { title: "", url: "" }],
    }));
  };

  const handleRemoveNewLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documentLinks: (prev.documentLinks || []).filter((_, i) => i !== index),
    }));
  };

  const handleChangeNewLinkField = (
    index: number,
    field: keyof DocumentLinkNew,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => {
      const links = [...(prev.documentLinks || [])];
      const updated = { ...links[index], [field]: value } as DocumentLinkNew;
      links[index] = updated;
      return { ...prev, documentLinks: links };
    });
    // Clear validation error for this specific field if any
    const path = `documentLinks[${index}].${String(field)}`;
    setErrors((prev) => {
      const next = { ...prev } as Record<string, string>;
      if (next[path]) delete next[path];
      return next;
    });
  };

  const getFileNameFromPath = (filePath: string): string => {
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1] || filePath;
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      setDownloadingFile(fileId);
      dispatch(startLoading());

      const response = await downloadDocumentAttachment(id!, fileId);

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

      message.error(errorMessage);
    } finally {
      setDownloadingFile(null);
      dispatch(stopLoading());
    }
  };

  const handleValidationError = (error: {
    inner: Array<{ path: string; message: string }>;
  }) => {
    const validationErrors: FormErrorType = {};
    error.inner.forEach((err: { path: string; message: string }) => {
      validationErrors[err.path] = err.message;
    });
    setErrors(validationErrors);
  };

  const handleSubmit = async () => {
    dispatch(startLoading());

    try {
      const schema = id
        ? editDocumentValidationSchema
        : createDocumentValidationSchema;

      await schema.validate(formData, { abortEarly: false });

      // Ensure at least one document file or link is provided
      const hasNewFiles =
        formData.documentFiles && formData.documentFiles.length > 0;
      const hasNewLinks =
        formData.documentLinks && formData.documentLinks.length > 0;

      if (!id) {
        // Create: require at least one of file or link
        if (!hasNewFiles && !hasNewLinks) {
          setErrors((prev) => ({
            ...prev,
            documentFiles:
              "Please upload at least one document file or add a link.",
            documentLinks: "Please add at least one link or upload a file.",
          }));
          dispatch(stopLoading());
          return;
        }
      } else {
        // Edit: consider existing files and checked deletions
        const remainingFilesAfterDelete =
          existingFiles.length - filesToDelete.length;
        const totalFilesAfterOperation =
          remainingFilesAfterDelete +
          (hasNewFiles ? formData.documentFiles.length : 0);
        const hasExistingLinks =
          existingLinks.length - linksToDelete.length > 0;

        if (
          totalFilesAfterOperation <= 0 &&
          !hasNewLinks &&
          !hasExistingLinks
        ) {
          setErrors((prev) => ({
            ...prev,
            documentFiles:
              "Please keep at least one file or add a new file/link.",
            documentLinks:
              "Please add at least one link if all files are deleted.",
          }));
          dispatch(stopLoading());
          return;
        }
      }

      // Check if user is trying to delete all files without adding new ones
      if (id && existingFiles.length > 0) {
        const remainingFilesAfterDelete =
          existingFiles.length - filesToDelete.length;
        const newFilesCount = formData.documentFiles.length;
        const totalFilesAfterOperation =
          remainingFilesAfterDelete + newFilesCount;

        if (totalFilesAfterOperation === 0) {
          setErrors((prev) => ({
            ...prev,
            documentFiles:
              "At least one file is required. Please add new files before deleting all existing ones.",
          }));
          dispatch(stopLoading());
          return;
        }
      }

      // File validation for new uploads
      if (formData.documentFiles.length > 0) {
        // Validate file count (max 10 files)
        if (formData.documentFiles.length > 10) {
          setErrors((prev) => ({
            ...prev,
            documentFiles: "Maximum 10 files allowed",
          }));
          dispatch(stopLoading());
          return;
        }

        // Validate each file size (max 1MB per file)
        const invalidFiles = formData.documentFiles.filter(
          (file) => file.size > 5 * 1024 * 1024
        );
        if (invalidFiles.length > 0) {
          setErrors((prev) => ({
            ...prev,
            documentFiles: `Files must be less than 5MB each. Invalid files: ${invalidFiles
              .map((f) => f.name)
              .join(", ")}`,
          }));
          dispatch(stopLoading());
          return;
        }
      }

      console.log("[DEBUG] formData before FormData creation:", formData);

      const formDataToSend = new FormData();

      if (id) {
        formDataToSend.append("documentId", id);
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          // Never send deleteLinkIds in the general loop; handled only for update below
          if (key === "deleteLinkIds") {
            return;
          }
          if (key === "securityTypeId") {
            formDataToSend.append(key, Number(value).toString());
          } else if (key === "tenantId") {
            // Always send tenantId if present
            formDataToSend.append("tenantId", Number(value).toString());
          } else if (key === "documentFiles") {
            if (Array.isArray(value) && value.length > 0) {
              value.forEach((file: File) => {
                formDataToSend.append("documentFiles", file);
              });
            }
          } else if (key === "documentLinks") {
            if (Array.isArray(value) && value.length > 0) {
              value.forEach(
                (link: { title?: string; url?: string }, index: number) => {
                  if (link && typeof link === "object") {
                    if (link.title !== undefined) {
                      formDataToSend.append(
                        `documentLinks[${index}][title]`,
                        String(link.title)
                      );
                    }
                    if (link.url !== undefined) {
                      formDataToSend.append(
                        `documentLinks[${index}][url]`,
                        String(link.url)
                      );
                    }
                  }
                }
              );
            }
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      // Add files to delete for update operations
      if (id && filesToDelete.length > 0) {
        formDataToSend.append("deleteFileIds", filesToDelete.join(","));
      }

      // Add links to delete for update operations (skip for create)
      if (id && linksToDelete.length > 0) {
        formDataToSend.append("deleteLinkIds", linksToDelete.join(","));
      }

      const apiFunction = id
        ? updateDocumentApiFunction
        : createDocumentApiFunction;

      const response = await apiFunction(formDataToSend);

      if (response) {
        setModalOpen(true);
        if (!id) setFormData(initialState);
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ValidationError" &&
        "inner" in error &&
        Array.isArray(error.inner)
      ) {
        handleValidationError(
          error as { inner: Array<{ path: string; message: string }> }
        );
      } else {
        setIsErrorModelOpen(true);
        const errorMessage =
          error instanceof Error
            ? error.message
            : error &&
              typeof error === "object" &&
              "response" in error &&
              error.response &&
              typeof error.response === "object" &&
              "data" in error.response &&
              error.response.data &&
              typeof error.response.data === "object" &&
              "message" in error.response.data
              ? String(error.response.data.message)
              : "Network Error";
        setErrors({
          apiError: errorMessage,
        });
      }
    } finally {
      dispatch(stopLoading());
    }
  };

  useEffect(() => {
    if (id) dispatch(fetchDocumentById({ id }));
  }, [id, dispatch]);

  useEffect(() => {
    if (id && documentData?.content?.data) {
      const {
        name,
        description,
        status,
        severityTypeId,
        tenantId,
        files,
        links,
      } = documentData.content.data;
      setFormData({
        name,
        description,
        status,
        securityTypeId: severityTypeId?.toString() || "",
        documentFiles: [],
        tenantId: tenantId?.toString() || "",
        documentLinks: [],
        deleteLinkIds: [],
      });
      if (files && Array.isArray(files)) {
        setExistingFiles(files);
      }
      if (links && Array.isArray(links)) {
        setExistingLinks(links as unknown as DocumentLinkExisting[]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        tenantId: isSuperAdmin ? "" : tenentId?.toString(),
      }));
    }
  }, [id, documentData, tenentId, isSuperAdmin]);

  // Fetch companies with search and pagination (for super admin)
  const fetchCompanies = useCallback(
    async (search = "", page = 1): Promise<void> => {
      setCompanyLoading(true);
      const response = await dispatch(
        fetchCompaniesList({ search, page, limit: 20 })
      );
      let companies: Company[] = [];
      if (
        response?.payload &&
        typeof response.payload === "object" &&
        "content" in response.payload &&
        response.payload.content &&
        "result" in
        (response.payload as { content: { result?: { data?: unknown } } })
          .content &&
        (response.payload as { content: { result?: { data?: unknown } } })
          .content.result &&
        Array.isArray(
          (response.payload as { content: { result: { data?: Company[] } } })
            .content.result.data
        )
      ) {
        companies = (
          response.payload as { content: { result: { data: Company[] } } }
        ).content.result.data;
      }
      setCompanyHasMore(companies.length === 20);
      setCompanyOptions((prev) =>
        page === 1 ? companies : [...prev, ...companies]
      );
      setCompanyLoading(false);
    },
    [dispatch]
  );

  useEffect(() => {
    if (isSuperAdmin) {
      fetchCompanies("", 1);
    }
  }, [fetchCompanies, isSuperAdmin]);

  const handleCompanySearch = (query: string) => {
    setCompanySearchQuery(query);
    setCompanyPage(1);
    fetchCompanies(query, 1);
  };

  const handleCompanyLoadMore = () => {
    if (companyHasMore && !companyLoading) {
      const nextPage = companyPage + 1;
      setCompanyPage(nextPage);
      fetchCompanies(companySearchQuery, nextPage);
    }
  };

  if (loading) return <div></div>;
  if (error) return <ErrorMessage message={error} />;

  const document = documentData?.content?.data;

  // View Mode Component
  if (isViewMode && document) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Breadcrumb path="Document" subPath="View Document" />

        <div className="container mx-auto py-8 px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {document.name}
            </h1>
            <div className="flex flex-wrap gap-4 items-center">
              <Tag color="green" className="text-base px-4 py-1 rounded-full">
                {document.status}
              </Tag>
              <Tag color="red" className="text-base px-4 py-1 rounded-full">
                {document.securityType?.name}
              </Tag>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-orange-100 p-6 rounded-2xl">
                <FileText size={64} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">
                  Description
                </h2>
                <p className="text-gray-600">{document.description}</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">Files</h2>
            <div className="space-y-4">
              {document.files && document.files.length > 0 ? (
                document.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow transition"
                  >
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div>
                        <span className="font-medium text-gray-800">
                          Version:
                        </span>
                        <span className="ml-1 text-gray-700">
                          {file.version}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">Path:</span>
                        <span className="ml-1 text-gray-700 break-all">
                          {file.filePath}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">
                          Created:
                        </span>
                        <span className="ml-1 text-gray-700">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      icon={<Download className="w-4 h-4" />}
                      className="mt-3 sm:mt-0"
                      onClick={() => handleDownload(file.id, file.filePath)}
                    >
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No files available for this document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        path="Document"
        subPath={`${id ? "Edit" : "Create"} Document`}
      />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 -mt-2 ">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            {id ? "Edit" : "Add"} Document
          </h1>
          {id && (
            <div className="ml-auto">
              <Button
                type="default"
                icon={<Eye className="w-4 h-4" />}
                onClick={() =>
                  navigate(`/${rolePrefix}/documents/document-details?id=${id}`)
                }
                className="flex items-center gap-2"
              >
                View Document
              </Button>
            </div>
          )}
        </div>

        <main className="bg-white p-8 rounded-lg shadow-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isSuperAdmin && (
                <SelectField
                  label="Company"
                  name="tenantId"
                  required
                  value={formData.tenantId}
                  onChange={handleChange}
                  disabled={!!id}
                  error={errors.tenantId}
                  options={companyOptions.map((c) => ({
                    label: c.name,
                    value: String(c.id),
                  }))}
                  placeholder="Select Company"
                  className="w-full md:col-span-2"
                  isSearchable
                  isInfiniteScroll
                  onSearch={handleCompanySearch}
                  onLoadMore={handleCompanyLoadMore}
                  loading={companyLoading}
                  customDropdown={true}
                />
              )}
              <TextField
                label="Document Name"
                placeholder="Document Name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                className="col-span-2"
                maxLength={200}
              />

              <TextAreaField
                label="Description"
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                error={errors.description}
                className="col-span-2"
                maxLength={500}
              />

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  error={errors.status}
                  options={StatusList}
                  placeholder="Select Status"
                  className="w-full"
                  customDropdown={true}
                />

                <SelectField
                  label="Security Type"
                  name="securityTypeId"
                  required
                  value={formData.securityTypeId}
                  onChange={handleChange}
                  error={errors.securityTypeId}
                  options={SecurityList}
                  placeholder="Select Security Type"
                  className="w-full"
                  customDropdown={true}
                />
              </div>

              {/* Existing Files Section - Only show for edit mode */}
              {id && existingFiles.length > 0 && (
                <div className="col-span-2">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Existing Files
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select files to delete (optional) or download files
                    </p>
                  </div>
                  <div className="space-y-3">
                    {existingFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${filesToDelete.includes(file.id)
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`file-${file.id}`}
                            checked={filesToDelete.includes(file.id)}
                            onChange={() => handleFileDelete(file.id)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <div>
                            <label
                              htmlFor={`file-${file.id}`}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {getFileNameFromPath(file.filePath)}
                            </label>
                            <div className="text-xs text-gray-500">
                              Version: {file.version} | Status: {file.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-xs text-gray-500">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            icon={<Download className="w-3 h-3" />}
                            loading={downloadingFile === file.id}
                            onClick={() =>
                              handleDownload(file.id, file.filePath)
                            }
                            className="flex items-center gap-1"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filesToDelete.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> {filesToDelete.length} file(s)
                        will be permanently deleted.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* New Files Upload Section */}
              <div className="col-span-2">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {id ? "Add New Files (Optional)" : "Document Files"}
                    {/* {!id && <span className="text-red-500 ml-1">*</span>} */}
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload up to 10 files (1MB each max). Supported formats:
                    PDF, Word, Excel
                  </p>
                  <p className="text-xs text-blue-700 mb-2">
                    Note: Please submit either a document file or add at least one link.
                  </p>
                </div>

                {/* File Input */}
                <input
                  type="file"
                  multiple
                  accept=".pdf, .doc, .docx, .xls, .xlsx, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => handleChangeFiles(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {/* Selected Files Display */}
                {formData.documentFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Selected Files:
                    </h4>
                    {formData.documentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          icon={<X className="w-3 h-3" />}
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {errors.documentFiles && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.documentFiles}
                  </p>
                )}

                {id && (
                  <p className="text-sm text-gray-600 mt-2">
                    Leave empty to keep existing files only
                  </p>
                )}
              </div>

              {/* Existing Links Section - Only show for edit mode; shown above Document Links */}
              {id && existingLinks.length > 0 && (
                <div className="col-span-2">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Existing Links
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select links to delete (optional)
                    </p>
                  </div>
                  <div className="space-y-3">
                    {existingLinks.map((link) => (
                      <div
                        key={link.id}
                        className={`p-4 border rounded-xl shadow-sm hover:shadow-md transition ${linksToDelete.includes(link.id)
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-white"
                          }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`link-${link.id}`}
                              checked={linksToDelete.includes(link.id)}
                              onChange={() => handleExistingLinkDelete(link.id)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                            />
                            <Tooltip
                              text={link.title}
                              maxLength={30}
                              position="top"
                            >
                              <label
                                htmlFor={`link-${link.id}`}
                                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                              >
                                {link.title}
                              </label>
                            </Tooltip>
                          </div>
                          <div className="md:col-span-2">
                            <Tooltip
                              text={link.url}
                              maxLength={50}
                              position="top"
                            >
                              <div className="text-sm">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                  onClick={(e) => {
                                    if (linksToDelete.includes(link.id)) {
                                      e.preventDefault();
                                      message.warning(
                                        "Cannot open link marked for deletion"
                                      );
                                    }
                                  }}
                                >
                                  {link.url}
                                </a>
                              </div>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {linksToDelete.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> {linksToDelete.length} link(s)
                        will be permanently deleted.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* New Links Section */}
              <div className="col-span-2 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Document Links
                  </h3>
                  <Button type="dashed" onClick={handleAddNewLink}>
                    Add Link
                  </Button>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  Note: Please submit either a document file or add at least one link.
                </p>
                {(formData.documentLinks || []).length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No links added. Use "Add Link" to include video, document,
                    or external resources.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {(formData.documentLinks || []).map((link, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Link title"
                              value={link.title}
                              onChange={(e) =>
                                handleChangeNewLinkField(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors[`documentLinks[${index}].title`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`documentLinks[${index}].title`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              URL <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="url"
                                placeholder="https://..."
                                value={link.url}
                                onChange={(e) =>
                                  handleChangeNewLinkField(
                                    index,
                                    "url",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {link.url && (
                                <div className="absolute right-3 top-2">
                                  <Tooltip
                                    text={link.url}
                                    maxLength={40}
                                    position="top"
                                  >
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                      onClick={(e) => {
                                        if (!link.url.startsWith("http")) {
                                          e.preventDefault();
                                          message.warning(
                                            "Please enter a valid URL starting with http:// or https://"
                                          );
                                        }
                                      }}
                                    >
                                      🔗
                                    </a>
                                  </Tooltip>
                                </div>
                              )}
                            </div>
                            {errors[`documentLinks[${index}].url`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`documentLinks[${index}].url`]}
                              </p>
                            )}
                          </div>
                          {/* Link Type, Display Order, Public controls hidden per requirement */}
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button
                            type="text"
                            danger
                            icon={<Trash className="w-4 h-4" />}
                            aria-label="Delete link"
                            onClick={() => handleRemoveNewLink(index)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
              <ButtonSecondary text="Cancel" onClick={() => navigate(-1)} />
              <ButtonPrimary text={id ? "Update" : "Add"} type="submit" />
            </div>
          </form>
        </main>
      </div>

      <SuccessModal
        isOpen={isModalOpen}
        title={`Document ${id ? "Edited" : "Created"} Successfully`}
        subtitle="Your Document has been published."
        onCancel={() => {
          setModalOpen(false);
          navigate(-1);
        }}
        onConfirm={() => navigate(-1)}
        onClose={() => {
          setModalOpen(false);
        }}
      />

      <ErrorModal
        isOpen={isErrorModelOpen}
        title={
          errors.apiError ||
          `Error While ${id ? "Editing" : "Creating"} Document`
        }
        onCancel={() => setIsErrorModelOpen(false)}
        onClose={() => setIsErrorModelOpen(false)}
      />
    </div>
  );
};

export default CreateUpdateDocuments;
