import React, { useEffect, useState, useCallback, useMemo } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import FileInputField from "../../components/FileInputField";
import { fetchCertificationsWithoutAssessment } from "../../lib/network/certificationApi";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { uploadAssessmentByExcelValidationSchema } from "../../lib/ValidationsSchema";
import {
  uploadOrUpdateAssessmentQuestionsByExcel,
  exportExcelByModuleIdApiFunction,
} from "../../lib/network/assessmentApis";
import ErrorModal from "../../components/ErrorModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import { Company } from "../../lib/interface/company";
import debounce from "lodash/debounce";

interface FormDataType {
  certificationId: string;
  assessmentFile: File | null;
  forceNewGroup?: boolean;
}

interface FormErrorType {
  [key: string]: string;
}

const CreateUpdateAssessmentExcel: React.FC = () => {
  const { user, tenentId, isSuperAdmin } = useLocalStorageUserData();
  const [searchParams] = useSearchParams();
  const certificationId = searchParams.get("certificationId");
  const certificationTitleParam = searchParams.get("certificationTitle") || "";
  const tenantIdParam = searchParams.get("tenantId") || "";
  const tenantNameParam = searchParams.get("tenantName") || "";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [companyOptions, setCompanyOptions] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  // Add tenantId state for super admin
  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    // For edit mode, prioritize tenantIdParam if available
    if (tenantIdParam) {
      return tenantIdParam;
    }
    // For super admin in create mode, start with empty string
    if (isSuperAdmin) {
      return "";
    }
    // For non-super admin, use tenentId
    return tenentId?.toString() || "";
  });

  const initialState: FormDataType = {
    certificationId: certificationId || "",
    assessmentFile: null,
    forceNewGroup: true,
  };

  const [formData, setFormData] = useState<FormDataType>({
    ...initialState,
    certificationId: certificationId || "",
  });
  const [errors, setErrors] = useState<FormErrorType>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);
  // Prefill existing Excel file (optional via query params)
  const existingFileName = searchParams.get("excelFileName") || "";
  const existingFileUrl = searchParams.get("excelFileUrl") || "";
  const existingFileSizeKbParam = searchParams.get("excelFileSizeKb");
  const existingFileSizeKb = existingFileSizeKbParam
    ? Number(existingFileSizeKbParam)
    : undefined;
  const [hasExistingExcel, setHasExistingExcel] = useState<boolean>(
    Boolean(certificationId && existingFileName)
  );
  // Guidelines modal state - will be implemented in next phase
  // const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);

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
          (response.payload as { content?: { result?: { data?: Company[] } } })
            .content?.result?.data
        )
      ) {
        companies =
          (response.payload as { content?: { result?: { data?: Company[] } } })
            .content?.result?.data || [];
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

  // Update selectedTenantId when tenantIdParam changes (for edit mode)
  useEffect(() => {
    if (tenantIdParam && tenantIdParam !== selectedTenantId) {
      setSelectedTenantId(tenantIdParam);
    }
  }, [tenantIdParam, selectedTenantId]);

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

  // Fetch certifications with search and pagination (scoped by tenant)
  const fetchCertifications = useCallback(
    async (search = "", page = 1): Promise<void> => {
      setCertificationLoading(true);
      try {
        // Determine tenant to use
        const tenantToUse = isSuperAdmin
          ? (selectedTenantId || tenantIdParam || "")
          : tenentId?.toString();

        // For super admin without a selected tenant, defer fetching until chosen
        if (isSuperAdmin && !tenantToUse) {
          setCertificationOptions([]);
          setCertificationHasMore(false);
          setCertificationLoading(false);
          return;
        }

        const response = await fetchCertificationsWithoutAssessment({
          limit: 20,
          page,
          search,
          sortBy: "title",
          status: "active",
          isAssessmentRequired: true,
          tenantId: tenantToUse,
        });

        const list = response?.content?.data || [];
        const newOptions = list.map(
          (c: { title: string; id: number | string }) => ({
            label: c.title,
            value: String(c.id),
          })
        );

        setCertificationHasMore(list.length >= 20);
        setCertificationOptions((prev) =>
          page === 1 ? newOptions : [...prev, ...newOptions]
        );
      } catch (error) {
        console.error("Error fetching certifications:", error);
        setCertificationOptions([]);
      } finally {
        setCertificationLoading(false);
      }
    },
    []
  );

  // Debounced certification search handler
  const debouncedCertificationSearch = useMemo(
    () =>
      debounce((query: string) => {
        setCertificationSearchQuery(query);
        setCertificationPage(1);
        fetchCertifications(query, 1);
      }, 300),
    [fetchCertifications]
  );

  // Handle certification search
  const handleCertificationSearch = (query: string) => {
    debouncedCertificationSearch(query);
  };

  // Handle certification load more
  const handleCertificationLoadMore = () => {
    if (certificationHasMore && !certificationLoading) {
      const nextPage = certificationPage + 1;
      setCertificationPage(nextPage);
      fetchCertifications(certificationSearchQuery, nextPage);
    }
  };

  // Fetch certifications (without assessment) based on selected tenantId
  useEffect(() => {
    fetchCertifications("", 1);
  }, [fetchCertifications, selectedTenantId, isSuperAdmin, tenentId, tenantIdParam]);

  // Reset search/pagination when dependencies change
  useEffect(() => {
    if (!certificationId) {
      setFormData((prev) => ({ ...prev, certificationId: "" }));
    }
    setCertificationSearchQuery("");
    setCertificationPage(1);
    setCertificationHasMore(true);
  }, [certificationId]);

  // Dropdown options (certifications without assessment)
  const [certificationOptions, setCertificationOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [certificationSearchQuery, setCertificationSearchQuery] = useState("");
  const [certificationPage, setCertificationPage] = useState(1);
  const [certificationLoading, setCertificationLoading] = useState(false);
  const [certificationHasMore, setCertificationHasMore] = useState(true);
  // removed unused selectedModuleOption
  const selectedCompanyOption =
    tenantIdParam && tenantNameParam
      ? [{ label: tenantNameParam, value: tenantIdParam }]
      : [];

  // useEffect(() => {
  //   const loadData = async () => {
  //     await dispatch(
  //       fetchModuleData({
  //         limit: 100,
  //         page: 1,
  //         searchQuery: "",
  //         status: "active",
  //       })
  //     );
  //   };

  //   loadData();

  //   // Cleanup when component unmounts
  //   return () => {
  //     // If you have a clearModuleData action, you can dispatch it here
  //     // dispatch(clearModuleData());
  //   };
  // }, [dispatch]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "tenantId") {
      setSelectedTenantId(value);
    }
  };

  const handleDownload = async () => {
    if (certificationId) {
      try {
        dispatch(startLoading());
        // Determine tenantId to use
        const tenantToUse = isSuperAdmin
          ? (selectedTenantId || tenantIdParam || "")
          : tenentId?.toString() || "";
        
        const excelData = await exportExcelByModuleIdApiFunction({
          certificationId: certificationId,
          tenantId: tenantToUse || undefined,
        });

        // apiRequest already returns response.data, so excelData is already the blob
        // Validate that we received actual blob data
        if (!excelData) {
          throw new Error("No data received from server");
        }

        // Check if the blob might be an error response (JSON instead of Excel)
        if (excelData instanceof Blob) {
          // If it's a small blob, it might be an error JSON
          if (excelData.size < 100) {
            const text = await excelData.text();
            try {
              const errorJson = JSON.parse(text);
              throw new Error(errorJson.message || errorJson.error || "Failed to download template");
            } catch (parseError) {
              // Not JSON, continue with download
            }
          }
        }

        // Create a blob from the response (in case it's not already a blob)
        const blob = excelData instanceof Blob 
          ? excelData 
          : new Blob([excelData], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

        // Validate blob size (should be > 0 for a valid Excel file)
        if (blob.size === 0) {
          throw new Error("Downloaded file is empty. Please check if assessment questions exist for this certification.");
        }

        // Create a temporary download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        // Create a safe filename with certification title if available
        const safeTitle = certificationTitleParam
          ? certificationTitleParam.replace(/[^a-z0-9]/gi, "_").toLowerCase()
          : "";
        const fileName = safeTitle
          ? `${safeTitle}-assessment-${certificationId}.xlsx`
          : `certification-assessment-${certificationId}.xlsx`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error: unknown) {
        console.error("Download error:", error);
        setIsErrorModelOpen(true);
        
        // Handle blob error responses
        let errorMessage = "Network Error";
        if (error && typeof error === "object" && "response" in error) {
          const apiError = error as {
            response?: { 
              data?: { message?: string };
              status?: number;
            };
          };
          
          // If it's a blob error response, try to read it
          if (apiError.response?.data instanceof Blob) {
            try {
              const errorText = await (apiError.response.data as Blob).text();
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || `Error ${apiError.response.status || ""}`;
            } catch {
              errorMessage = apiError.response?.data?.message || `Error ${apiError.response.status || ""}`;
            }
          } else {
            errorMessage = apiError.response?.data?.message || (apiError.response?.status ? `Error ${apiError.response.status}` : "Network Error");
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setErrors({
          apiError: errorMessage,
        });
      } finally {
        dispatch(stopLoading());
      }
      return;
    }

    // If certificationId is not provided, download the static template
    const link = document.createElement("a");
    link.href = "/files/module-assessment.xlsx";
    link.download = "module-assessment.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    dispatch(startLoading());
    try {
      const validationSchema = uploadAssessmentByExcelValidationSchema;

      await validationSchema.validate(formData, { abortEarly: false });

      const formDataToSend = new FormData();

      const modifiedFormData = {
        ...formData,
        tenantId: selectedTenantId || tenantIdParam,
        forceNewGroup: true, // Always create new assessment group
      };

      Object.entries(modifiedFormData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File || value instanceof Blob) {
            formDataToSend.append(key, value);
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      const response = await uploadOrUpdateAssessmentQuestionsByExcel(formDataToSend);
      console.log("Upload response:", response);
      setModalOpen(true);
    } catch (error: unknown) {
      console.error("Upload error:", error);

      setIsErrorModelOpen(true);
      const backendMessage =
        (error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : undefined) ||
        (error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined) ||
        (typeof error === "string" ? error : "") ||
        "Error While Uploading Assessment";

      setErrors({
        apiError: backendMessage,
      });
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  console.log("user-->", user);

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        path="Assessment"
        subPath={`${certificationId ? "Edit" : "Create"} Questions`}
      />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800  mr-130">
            {`${certificationId ? "Edit" : "Create"} Questions`}
          </h1>
          <ButtonPrimary
            text={certificationId ? "Download Existing Template" : "Download Questions Template"}
            onClick={handleDownload}
            className="max-w-fit"
            type="button"
          />
        </div>

        <main className="bg-white p-8 rounded-lg shadow-sm">
          {/* <h1 className="text-lg sm:text-xl font-semibold mb-1">
            {`${moduleId ? "Edit" : "Create"} Questions`}
          </h1>
          <span className="text-gray-500 text-sm">
            Make changes questions quickly and easily..
          </span> */}

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {isSuperAdmin && (
                <SelectField
                  label="Select Company"
                  name="tenantId"
                  required
                  value={selectedTenantId}
                  onChange={handleChange}
                  options={
                    tenantIdParam && tenantNameParam
                      ? selectedCompanyOption
                      : companyOptions.map((c) => ({
                          label: c.name,
                          value: String(c.id),
                        }))
                  }
                  error={errors.tenantId}
                  placeholder="Select..."
                  isSearchable={!tenantIdParam}
                  isInfiniteScroll={!tenantIdParam}
                  onSearch={!tenantIdParam ? handleCompanySearch : undefined}
                  onLoadMore={
                    !tenantIdParam ? handleCompanyLoadMore : undefined
                  }
                  loading={companyLoading}
                  customDropdown={true}
                  disabled={!!tenantIdParam}
                />
              )}
              {!!certificationId && !!certificationTitleParam ? (
                <div className="flex flex-col min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded border border-gray-200 text-gray-800 break-words break-all whitespace-pre-wrap min-w-0">
                    {certificationTitleParam}
                  </div>
                </div>
              ) : (
                <SelectField
                  label="Available Certifications"
                  name="certificationId"
                  required
                  value={formData.certificationId}
                  onChange={handleChange}
                  options={certificationOptions}
                  error={errors.certificationId}
                  placeholder="Select certification..."
                  isSearchable={true}
                  isInfiniteScroll={true}
                  onSearch={handleCertificationSearch}
                  onLoadMore={handleCertificationLoadMore}
                  loading={certificationLoading}
                  customDropdown={true}
                  className="min-w-0"
                />
              )}


              <div className="col-span-1 md:col-span-2">
                {hasExistingExcel && !formData.assessmentFile && (
                  <div className="mb-3 flex items-center justify-between text-sm bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="min-w-0">
                        {existingFileUrl ? (
                          <a
                            href={existingFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-blue-600 hover:text-blue-700 truncate block"
                            title={existingFileName}
                          >
                            {existingFileName}
                          </a>
                        ) : (
                          <p
                            className="font-semibold text-gray-800 truncate"
                            title={existingFileName}
                          >
                            {existingFileName}
                          </p>
                        )}
                        {typeof existingFileSizeKb === "number" && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {existingFileSizeKb.toFixed(1)} KB • Existing file
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setHasExistingExcel(false)}
                      type="button"
                      className="text-gray-400 hover:text-orange-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                      aria-label="Remove existing file"
                    >
                      ×
                    </button>
                  </div>
                )}
                <FileInputField
                  label="Upload Questions"
                  required
                  onChange={(file) => {
                    setFormData((prev) => ({ ...prev, assessmentFile: file }));
                    setErrors((prev) => ({ ...prev, assessmentFile: "" }));
                  }}
                  error={errors.assessmentFile}
                  format="Excel"
                  accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                />
              </div>

              <SuccessModal
                isOpen={isModalOpen}
                title={`Assessment Questions ${
                  certificationId ? "Updated" : "Uploaded"
                } Successfully`}
                subtitle={`Your Assessment Questions ${
                  certificationId ? "Updated" : "Uploaded"
                } have been published.`}
                onCancel={() => {
                  if (!certificationId) setFormData(initialState);
                  setModalOpen(false);
                  const base = isSuperAdmin ? "/super-admin" : "/trainer";
                  navigate(`${base}/assessments`);
                }}
                onConfirm={() => {
                  const base = isSuperAdmin ? "/super-admin" : "/trainer";
                  navigate(`${base}/assessments`);
                }}
                onClose={() => {
                  if (!certificationId) setFormData(initialState);
                  setModalOpen(false);
                  const base = isSuperAdmin ? "/super-admin" : "/trainer";
                  navigate(`${base}/assessments`);
                }}
              />

              <ErrorModal
                isOpen={isErrorModelOpen}
                title={errors.apiError || `Error While Uploading Assessment`}
                onCancel={() => setIsErrorModelOpen(false)}
                onClose={() => setIsErrorModelOpen(false)}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">
              <ButtonSecondary text="Cancel" onClick={handleBack} />
              <ButtonPrimary text="Submit" onClick={handleSubmit} />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreateUpdateAssessmentExcel;
