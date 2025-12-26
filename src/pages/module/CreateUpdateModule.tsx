import React, { useEffect, useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { WizdomCategoryList } from "../../lib/constants";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { createModuleValidationSchema } from "../../lib/ValidationsSchema";
import {
  createModuleApiFunction,
  fetchModuleById,
  updateModuleApiFunction,
  downloadModuleFile,
} from "../../lib/network/moduleApi";
import ErrorModal from "../../components/ErrorModal";
// import MultiSelectField from "../../components/MultiSelectField";
import { fetchDocumentData } from "../../lib/network/documentApis";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ErrorMessage from "../../components/ErrorMessage";
import TextAreaField from "../../components/TextAreaField";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { Module } from "../../lib/types/module";
import { message, Button } from "antd";
import { Download, Eye } from "lucide-react";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import { Company } from "../../lib/interface/company";

interface FormDataType {
  name: string;
  description: string;
  // assessment: string;
  // feedback: string;
  status: string;
  allotedTimeMins: string;
  createdBy: string;
  wizdomCategory: string;
  documentIds: string[];
  moduleFiles: File[];
  deleteFileIds?: number[];
  tenantId?: string; // <-- Add for super admin
}

interface OptionType {
  label: string;
  value: string;
}

interface ApiErrorResponse {
  message?: string;
  data?: {
    message?: string;
  };
}

interface ApiError {
  message?: string;
  response?: ApiErrorResponse;
}

// Define ModuleFile interface
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

const initialState: FormDataType = {
  name: "",
  description: "",
  // assessment: "no", // Default value for optional field
  // feedback: "no", // Default value for optional field
  allotedTimeMins: "",
  status: "active",
  wizdomCategory: "",
  createdBy: "",
  documentIds: [],
  moduleFiles: [],
  deleteFileIds: [],
  tenantId: "",
};

const CreateModule: React.FC = () => {
  const { user, tenentId, isSuperAdmin } = useLocalStorageUserData();
  const [formData, setFormData] = useState<FormDataType>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const location = useLocation();
  const rolePrefix = location.pathname.split("/")[1]; // e.g., 'super-admin', 'admin', 'trainer'

  const { moduleById, loading, error } = useSelector(
    (state: RootState) => state.module
  );
  const documents = useSelector((state: RootState) => state.document.data);

  const [companyOptions, setCompanyOptions] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  // Document search and pagination state
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [documentPage, setDocumentPage] = useState(1);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentHasMore, setDocumentHasMore] = useState(true);
  const [existingDocumentOptions, setExistingDocumentOptions] = useState<
    OptionType[]
  >([]);

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
        "result" in response.payload.content &&
        response.payload.content.result &&
        Array.isArray(
          (response.payload as { content: { result: { data: Company[] } } })
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

  // Fetch documents with search and pagination
  const fetchDocuments = useCallback(
    async (search = "", page = 1): Promise<void> => {
      const tenantToUse = isSuperAdmin
        ? formData.tenantId
        : tenentId?.toString();

      if (!tenantToUse || tenantToUse === "") {
        return;
      }

      setDocumentLoading(true);
      try {
        const response = await dispatch(
          fetchDocumentData({
            limit: 20,
            page,
            searchQuery: search,
            status: "active",
            tenantId: tenantToUse,
          })
        );

        // Extract documents from the response
        let documentList: unknown[] = [];
        if (
          response?.payload &&
          typeof response.payload === "object" &&
          "documents" in response.payload &&
          Array.isArray(
            (response.payload as { documents: unknown[] }).documents
          )
        ) {
          documentList = (response.payload as { documents: unknown[] })
            .documents;
        }

        setDocumentHasMore(documentList.length >= 20);

        // The documents will be available in Redux state for the useMemo
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setDocumentLoading(false);
      }
    },
    [dispatch, isSuperAdmin, formData.tenantId, tenentId]
  );

  // Debounced document search
  const debouncedDocumentSearch = useCallback(
    debounce((query: string) => {
      fetchDocuments(query, 1);
    }, 500),
    [fetchDocuments]
  );

  const handleDocumentSearch = useCallback(
    (query: string) => {
      setDocumentSearchQuery(query);
      setDocumentPage(1);
      debouncedDocumentSearch(query);
    },
    [debouncedDocumentSearch]
  );

  const handleDocumentLoadMore = () => {
    if (documentHasMore && !documentLoading) {
      const nextPage = documentPage + 1;
      setDocumentPage(nextPage);
      fetchDocuments(documentSearchQuery, nextPage);
    }
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);

  // Add this state to track original documents
  const [originalDocumentIds, setOriginalDocumentIds] = useState<string[]>([]);

  // Add this state to track original module name
  const [originalModuleName, setOriginalModuleName] = useState<string>("");

  // Add this state to track existing module files
  const [existingModuleFiles, setExistingModuleFiles] = useState<ModuleFile[]>(
    []
  );

  // Add this state to track module files to delete
  const [moduleFilesToDelete, setModuleFilesToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchModuleById({ id }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && moduleById?.content?.data) {
      const moduleData = moduleById.content.data as Module & {
        moduleFiles?: ModuleFile[];
      };
      const {
        name,
        description,
        assessment,
        feedback,
        status,
        allotedTimeMins,
        MasterCategoryModel,
        Documents,
        moduleFiles,
      } = moduleData;

      // Store original name
      setOriginalModuleName(name);

      // Store original document IDs
      const originalDocs = Documents?.map((doc) => doc?.id?.toString()) || [];
      setOriginalDocumentIds(originalDocs);

      // Set existing document options to ensure they're always visible in dropdown
      if (Array.isArray(Documents)) {
        const existingDocs = Documents.map((doc) => ({
          label: doc.name,
          value: doc.id.toString(),
        }));
        setExistingDocumentOptions(existingDocs);
      }

      setFormData((prev) => ({
        ...prev,
        name,
        description: description || "",
        assessment: assessment?.toString(),
        feedback: feedback?.toString(),
        status: status || "active",
        allotedTimeMins: allotedTimeMins?.toString(),
        wizdomCategory: MasterCategoryModel?.id?.toString() || "",
        documentIds: originalDocs,
        createdBy: user?.employeeId,
        tenantId: (moduleData as Partial<Module>)?.tenantId?.toString() || "",
      }));

      // Set existing module files (only active)
      if (Array.isArray(moduleFiles)) {
        setExistingModuleFiles(
          moduleFiles.filter((f) => f.status === "active")
        );
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        createdBy: user?.employeeId,
        tenantId: isSuperAdmin ? "" : tenentId?.toString(),
        // assessment: "no", // Set default value for create mode
        // feedback: "no", // Set default value for create mode
      }));
    }
  }, [id, moduleById?.content?.data, user?.employeeId, tenentId, isSuperAdmin]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      // If company (tenantId) is changed by super admin, reset documentIds
      if (isSuperAdmin && name === "tenantId") {
        setExistingDocumentOptions([]); // Clear existing document options
        return {
          ...prev,
          [name]: value,
          documentIds: [],
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDocumentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      documentIds: Array.isArray(value) ? value : [],
    }));
    setErrors((prev) => ({ ...prev, documentIds: "" }));
  };

  const handleChangeFiles = (files: FileList | null) => {
    if (!files) {
      setFormData((prev) => ({ ...prev, moduleFiles: [] }));
      setErrors((prev) => ({ ...prev, moduleFiles: "" }));
      return;
    }
    const fileArray = Array.from(files);
    // Validate file count (max 10 files)
    if (fileArray.length > 10) {
      setErrors((prev) => ({
        ...prev,
        moduleFiles: "Maximum 10 files allowed",
      }));
      return;
    }
    // Validate each file size (max 5MB per file)
    const invalidFiles = fileArray.filter(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (invalidFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        moduleFiles: `Files must be less than 5MB each. Invalid files: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`,
      }));
      return;
    }
    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const invalidTypeFiles = fileArray.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidTypeFiles.length > 0) {
      setErrors((prev) => ({
        ...prev,
        moduleFiles: `Only PDF, Word or Excel files are allowed. Invalid files: ${invalidTypeFiles
          .map((f) => f.name)
          .join(", ")}`,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, moduleFiles: fileArray }));
    setErrors((prev) => ({ ...prev, moduleFiles: "" }));
  };
  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      moduleFiles: prev.moduleFiles.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({ ...prev, moduleFiles: "" }));
  };

  // Process validation errors and update the state
  const handleValidationError = (error: {
    inner: Array<{ path: string; message: string }>;
  }) => {
    const validationErrors: Record<string, string> = {};
    error.inner.forEach((err: { path: string; message: string }) => {
      validationErrors[err.path] = err.message;
    });
    setErrors(validationErrors);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      dispatch(startLoading());

      console.log("Form data being validated:", {
        ...formData,
        moduleFiles: formData.moduleFiles,
      });

      await createModuleValidationSchema.validate(
        { ...formData, moduleFiles: formData.moduleFiles },
        { abortEarly: false }
      );

      const formDataToSend = new FormData();

      if (id) {
        // Handle document changes
        const removedDocs = originalDocumentIds.filter(
          (docId) => !formData.documentIds.includes(docId)
        );

        const newDocs = formData.documentIds.filter(
          (docId) => !originalDocumentIds.includes(docId)
        );

        if (newDocs.length > 0) {
          newDocs.forEach((docId) =>
            formDataToSend.append("documentIds[]", docId)
          );
        }

        if (removedDocs.length > 0) {
          removedDocs.forEach((docId) =>
            formDataToSend.append("removeDocumentIds[]", docId)
          );
        }

        // Only add name if it has changed from original
        if (formData.name !== originalModuleName) {
          formDataToSend.append("name", formData.name);
        }

        formDataToSend.append("moduleId", id);

        if (formData.moduleFiles.length > 0) {
          formData.moduleFiles.forEach((file) => {
            formDataToSend.append("moduleFiles", file);
          });
        }
        // Append all required fields for update
        formDataToSend.append("description", formData.description);
        formDataToSend.append("allotedTimeMins", formData.allotedTimeMins);
        formDataToSend.append("status", formData.status);
        formDataToSend.append("wizdomCategory", formData.wizdomCategory);
        formDataToSend.append(
          "tenantId",
          isSuperAdmin ? formData.tenantId : tenentId
        );

        // For deleting module files
        if (moduleFilesToDelete.length > 0) {
          formDataToSend.append("deleteFileIds", moduleFilesToDelete.join(","));
        }
      } else {
        // For create, add all fields including name
        formData.documentIds.forEach((docId) =>
          formDataToSend.append("documentIds[]", docId)
        );
        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("createdBy", user?.employeeId || "");
        if (formData.moduleFiles.length > 0) {
          formData.moduleFiles.forEach((file) => {
            formDataToSend.append("moduleFiles", file);
          });
        }
        // Append all required fields for create
        formDataToSend.append("allotedTimeMins", formData.allotedTimeMins);
        formDataToSend.append("status", formData.status);
        formDataToSend.append("wizdomCategory", formData.wizdomCategory);

        formDataToSend.append(
          "tenantId",
          isSuperAdmin ? formData.tenantId : tenentId
        );
      }

      if (id) {
        console.log("Calling updateModuleApiFunction with:", formDataToSend);
        await updateModuleApiFunction(formDataToSend);
      } else {
        console.log("Calling createModuleApiFunction with:", formDataToSend);
        await createModuleApiFunction(formDataToSend);
      }
      console.log("API call successful, opening success modal");
      setModalOpen(true);
    } catch (error: unknown) {
      console.log("error-->", error);
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ValidationError" &&
        "inner" in error &&
        Array.isArray((error as { inner?: unknown }).inner)
      ) {
        handleValidationError(
          error as { inner: Array<{ path: string; message: string }> }
        );
      } else {
        setIsErrorModelOpen(true);
        const apiError = error as ApiError;
        console.log("apiError-->", apiError);
        setErrors({
          apiError:
            apiError.message ||
            apiError.response?.data?.message ||
            "Network Error",
        });
      }
    } finally {
      dispatch(stopLoading());
    }
  };

  useEffect(() => {
    if (formData.tenantId) {
      // Reset document search state when tenant changes
      setDocumentSearchQuery("");
      setDocumentPage(1);
      setDocumentHasMore(true);
      fetchDocuments("", 1);
    }
  }, [fetchDocuments, formData.tenantId]);

  // Create document options combining existing and fetched documents
  const documentOptions = useMemo<OptionType[]>(() => {
    const fetchedDocuments: OptionType[] = [];

    // Add documents from Redux state (fetched via pagination)
    if (Array.isArray(documents?.documents)) {
      const reduxDocuments = documents.documents
        .filter((doc) => {
          // Super Admin: filter by selected tenantId, only enable if tenantId is selected
          if (isSuperAdmin) {
            return (
              formData.tenantId && String(doc.tenantId) === formData.tenantId
            );
          }
          // Admin/Trainer: filter by user's tenantId
          return String(doc.tenantId) === tenentId?.toString();
        })
        .map((doc) => ({
          label: doc.name,
          value: doc.id.toString(),
        }));
      fetchedDocuments.push(...reduxDocuments);
    }

    // Add existing documents from module response (to ensure they're always visible)
    const combinedDocuments = [...existingDocumentOptions, ...fetchedDocuments];

    // Remove duplicates based on value
    const uniqueDocuments = combinedDocuments.filter(
      (doc, index, self) =>
        index === self.findIndex((d) => d.value === doc.value)
    );

    return uniqueDocuments;
  }, [
    documents,
    existingDocumentOptions,
    isSuperAdmin,
    formData.tenantId,
    tenentId,
  ]);

  // Add loading state handling
  if (loading && id) {
    return <div></div>;
  }

  // Add error state handling
  if (error && id) {
    return <ErrorMessage message={error} />;
  }

  const handleModuleFileDelete = (fileId: number) => {
    setModuleFilesToDelete((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDownload = async (
    fileId: number,
    filePath: string,
    version: number
  ) => {
    try {
      setDownloadingFile(fileId);
      dispatch(startLoading());

      const blob = await downloadModuleFile(id!, fileId);
      const url = window.URL.createObjectURL(blob);
      const ext = filePath.split(".").pop() || "file";
      const downloadFileName = `module-${id}-v${version}.${ext}`;
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
      message.error(errorMessage);
    } finally {
      setDownloadingFile(null);
      dispatch(stopLoading());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb path="Module" subPath={`${id ? "Edit" : "Create"} Module`} />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 -mt-2 ">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            {`${id ? "Edit" : "Create"}`} Module
          </h1>
          {id && (
            <div className="ml-auto">
              <Button
                type="default"
                icon={<Eye className="w-4 h-4" />}
                onClick={() =>
                  navigate(`/${rolePrefix}/modules/module-details?id=${id}`)
                }
                className="flex items-center gap-2"
              >
                View Module
              </Button>
            </div>
          )}
        </div>
        <main className="bg-white p-8 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company select should come just before Module Name for super admin */}
              {isSuperAdmin && (
                <SelectField
                  label="Company"
                  name="tenantId"
                  required
                  value={formData.tenantId}
                  onChange={handleChange}
                  error={errors.tenantId}
                  options={companyOptions.map((c) => ({
                    label: c.name,
                    value: String(c.id),
                  }))}
                  placeholder="Select Company"
                  className="w-full md:col-span-2"
                  disabled={Boolean(id)}
                  isSearchable
                  isInfiniteScroll
                  onSearch={handleCompanySearch}
                  onLoadMore={handleCompanyLoadMore}
                  loading={companyLoading}
                  customDropdown={true}
                />
              )}
              <TextField
                label="Module Name"
                placeholder="Module Name"
                name="name"
                error={errors.name}
                required
                value={formData.name}
                onChange={handleChange}
                className="col-span-2"
                maxLength={200}
              />

              <TextField
                label="Allotted time in minutes"
                placeholder="Time in minutes"
                name="allotedTimeMins"
                // required
                value={formData.allotedTimeMins}
                onChange={handleChange}
                error={errors.allotedTimeMins}
                className="col-span-2 md:col-span-1"
              />

              <SelectField
                label="Category"
                name="wizdomCategory"
                required
                value={formData.wizdomCategory}
                onChange={handleChange}
                error={errors.wizdomCategory}
                options={WizdomCategoryList}
                placeholder="Select Category"
                className="col-span-2 md:col-span-1"
                customDropdown={true}
              />

              <SelectField
                label="Documents"
                name="documentIds"
                options={documentOptions}
                value={formData.documentIds}
                onChange={handleDocumentChange}
                placeholder="Select Documents..."
                required
                error={errors.documentIds}
                className="col-span-2 md:col-span-1"
                isMultiSelect={true}
                isSearchable={true}
                isInfiniteScroll={true}
                onSearch={handleDocumentSearch}
                onLoadMore={handleDocumentLoadMore}
                loading={documentLoading}
                customDropdown={true}
                disabled={isSuperAdmin && !formData.tenantId}
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

              {/* Existing Module Attachments Section - Only show for edit mode */}
              {id && existingModuleFiles.length > 0 && (
                <div className="col-span-2">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Existing Module Attachments
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select files to delete (optional) or download files
                    </p>
                  </div>
                  <div className="space-y-3">
                    {existingModuleFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${moduleFilesToDelete.includes(file.id)
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`modulefile-${file.id}`}
                            checked={moduleFilesToDelete.includes(file.id)}
                            onChange={() => handleModuleFileDelete(file.id)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <div>
                            <label
                              htmlFor={`modulefile-${file.id}`}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {file.filePath.split(/[\\/]/).pop()}
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
                            icon={<Download className="w-4 h-4" />}
                            loading={downloadingFile === file.id}
                            onClick={() =>
                              handleDownload(
                                file.id,
                                file.filePath,
                                file.version
                              )
                            }
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {moduleFilesToDelete.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> {moduleFilesToDelete.length}{" "}
                        file(s) will be permanently deleted.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* New Files Upload Section */}
              <div className="col-span-2">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {id
                      ? "Add New Files (Optional)"
                      : "Module Files (Optional)"}
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload up to 10 files (5MB each max). Supported formats:
                    PDF, Word, Excel
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf, .doc, .docx, .xls, .xlsx, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => handleChangeFiles(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.moduleFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Selected Files:
                    </h4>
                    {formData.moduleFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <ButtonSecondary
                          text="Remove"
                          onClick={() => removeFile(index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {errors.moduleFiles && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.moduleFiles}
                  </p>
                )}
                {id && (
                  <p className="text-sm text-gray-600 mt-2">
                    Leave empty to keep existing files only
                  </p>
                )}
              </div>
              <SuccessModal
                isOpen={isModalOpen}
                title={`Module ${id ? "Edited" : "Created"} Successfully`}
                subtitle="Your Module has been published."
                onCancel={() => {
                  if (!id) {
                    setFormData(initialState);
                    setExistingDocumentOptions([]);
                  }
                  setModalOpen(false);
                }}
                onConfirm={() => navigate(-1)}
                onClose={() => {
                  if (!id) {
                    setFormData(initialState);
                    setExistingDocumentOptions([]);
                  }
                  setModalOpen(false);
                }}
              />
              <ErrorModal
                isOpen={isErrorModelOpen}
                title={
                  errors.apiError ||
                  `Error While ${id ? "Editing" : "Creating"} Module`
                }
                // subtitle="Your Module has been published."
                onCancel={() => {
                  setIsErrorModelOpen(false);
                }}
                onClose={() => {
                  setIsErrorModelOpen(false);
                }} // <-- handles outside click
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
              <ButtonSecondary text="Cancel" onClick={() => navigate(-1)} />
              <ButtonPrimary type="submit" text="Submit" />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreateModule;
