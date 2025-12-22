import React, { useEffect, useState, useCallback, useMemo } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchTrainingList } from "../../store/features/training/trainingSlice";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import {
  CreateCertificationApiFunction,
  fetchCertificationByIdApiFunction,
  updateCertificationApiFunction,
} from "../../lib/network/certificationApi";
import ErrorModal from "../../components/ErrorModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import TextAreaField from "../../components/TextAreaField";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import { Company } from "../../lib/interface/company";
import debounce from "lodash/debounce";

interface FormDataType {
  title: string;
  description: string;
  tenantId: string | null;
  assessmentRequired?: string; // "yes" | "no"
  assessmentTime: string;
  passPercentage: string;
  feedbackRequired?: string; // "yes" | "no"
  recurring?: string; // "yes" | "no"
  trainingIds: string[]; // Now will be sent to API
  removeModuleIds?: string[];
  interval_unit: string;
  interval_value: string;
  expiry_date: string;
  certificationId?: string;
  status: string;
}

interface FormErrorType {
  [key: string]: string;
}

interface FormDataToSendType {
  title?: string;
  description?: string;
  status?: string;
  interval_unit?: string | null;
  interval_value?: number | null;
  expiry_date?: string;
  isAssessmentRequired?: boolean;
  isRecurring?: boolean;
  assessmentTime?: number;
  passPercentage?: string;
  trainingIds?: number[];
  updateTrainingIds?: number[];
  removeTrainingIds?: number[];
  tenantId?: string;
  [key: string]: unknown;
}

interface TrainingFetchPayload {
  limit: number;
  page: number;
  status: string;
  tenantId: string;
  search?: string;
}

const initialState = {
  title: "",
  description: "",
  tenantId: null,
  assessmentRequired: "no",
  assessmentTime: "",
  passPercentage: "",
  feedbackRequired: "no",
  recurring: "no",
  trainingIds: [],
  removeModuleIds: [],
  interval_unit: "",
  interval_value: "",
  expiry_date: "",
  status: "active",
};

const CreateUpdateCertifications: React.FC = () => {
  const { tenentId, isSuperAdmin } = useLocalStorageUserData();
  console.log("tenentId-->", tenentId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: trainingData, loading: trainingLoading } = useSelector(
    (state: RootState) => state.training
  );
  const [formData, setFormData] = useState<FormDataType>(initialState);

  const [errors, setErrors] = useState<FormErrorType>({});

  const [isModalOpen, setModalOpen] = useState(false);
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);

  // Track original trainings (UI only)
  const [originalTrainingIds, setOriginalTrainingIds] = useState<string[]>([]);

  const [searchParams] = useSearchParams();
  const certificateId = searchParams.get("certificateId");
  const { data: certificationData } = useSelector(
    (state: RootState) => state.certificationById
  );

  const certification = certificationData?.content?.data;

  console.log("certification-->", certification);

  const [companyOptions, setCompanyOptions] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  // Training search and pagination state
  const [trainingSearchQuery, setTrainingSearchQuery] = useState("");
  const [trainingPage, setTrainingPage] = useState(1);
  const [trainingHasMore, setTrainingHasMore] = useState(true);
  const [isSearchingTrainings, setIsSearchingTrainings] = useState(false);

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

  // Debounced training search handler
  const debouncedTrainingSearch = useMemo(
    () =>
      debounce((query: string, tenantId: string) => {
        setIsSearchingTrainings(true);
        const payload: TrainingFetchPayload = {
          limit: 20,
          page: 1,
          status: "active",
          tenantId: tenantId,
        };

        // Only add search parameter if query is not empty
        if (query && query.trim()) {
          payload.search = query;
        }

        dispatch(fetchTrainingList(payload)).finally(() => {
          setIsSearchingTrainings(false);
        });
      }, 300),
    [dispatch]
  );

  // Handle training search
  const handleTrainingSearch = (query: string) => {
    setTrainingSearchQuery(query);
    setTrainingPage(1);

    const currentTenantId = isSuperAdmin
      ? formData.tenantId
      : tenentId?.toString() || "";
    if (currentTenantId) {
      debouncedTrainingSearch(query, currentTenantId);
    }
  };

  // Handle training load more
  const handleTrainingLoadMore = () => {
    if (trainingHasMore && !trainingLoading && !isSearchingTrainings) {
      const nextPage = trainingPage + 1;
      setTrainingPage(nextPage);
      setIsSearchingTrainings(true);

      const payload: TrainingFetchPayload = {
        limit: 20,
        page: nextPage,
        status: "active",
        tenantId: isSuperAdmin ? formData.tenantId : tenentId?.toString() || "",
      };

      // Only add search parameter if query is not empty
      if (trainingSearchQuery && trainingSearchQuery.trim()) {
        payload.search = trainingSearchQuery;
      }

      dispatch(fetchTrainingList(payload)).finally(() => {
        setIsSearchingTrainings(false);
      });
    }
  };

  useEffect(() => {
    if (certificateId) {
      dispatch(fetchCertificationByIdApiFunction({ certificateId }));
    }
  }, [dispatch, certificateId]);

  // Consolidated training fetch logic
  useEffect(() => {
    const currentTenantId = isSuperAdmin
      ? formData.tenantId
      : tenentId?.toString();

    // Only fetch if we have a tenant ID
    if (currentTenantId) {
      // Reset training search and pagination when tenant changes
      if (isSuperAdmin) {
        setTrainingSearchQuery("");
        setTrainingPage(1);
        setTrainingHasMore(true);
      }

      const payload: TrainingFetchPayload = {
        limit: 20,
        page: 1,
        status: "active",
        tenantId: currentTenantId,
      };

      dispatch(fetchTrainingList(payload));
    }
  }, [dispatch, formData.tenantId, isSuperAdmin, tenentId]);

  // Handle training data updates and pagination
  useEffect(() => {
    if (trainingData?.content?.data) {
      const trainings = trainingData.content.data;
      // Check if we have more pages based on the number of items returned
      // If we get less than the limit, we've reached the end
      setTrainingHasMore(trainings.length >= 20);
    }
  }, [trainingData]);

  useEffect(() => {
    if (certification && certificateId) {
      // Map original training IDs from certification data
      let originalTrainings: string[] = [];

      // Check for training IDs in different possible formats
      if (
        certification.trainingIds &&
        Array.isArray(certification.trainingIds)
      ) {
        originalTrainings = certification.trainingIds.map((id) =>
          id.toString()
        );
      } else if (
        certification.Trainings &&
        Array.isArray(certification.Trainings)
      ) {
        originalTrainings = certification.Trainings.map((training) =>
          training.id.toString()
        );
      } else if (
        certification.trainings &&
        Array.isArray(certification.trainings)
      ) {
        originalTrainings = certification.trainings.map((training) =>
          training.id.toString()
        );
      }

      setOriginalTrainingIds(originalTrainings);

      setFormData((prev) => ({
        ...prev,
        title: certification.title || "",
        description: certification.description || "",
        tenantId: certification.tenantId?.toString() || "",
        assessmentRequired: certification.isAssessmentRequired ? "yes" : "no",
        assessmentTime: certification.assessmentTime?.toString() || "",
        passPercentage: certification.passPercentage?.toString() || "",
        feedbackRequired: certification.isFeedbackRequired ? "yes" : "no",
        recurring: certification.isRecurring ? "yes" : "no",
        trainingIds: originalTrainings,
        interval_unit: certification.interval_unit || "",
        interval_value: certification.interval_value?.toString() || "",
        expiry_date: certification.expiry_date
          ? new Date(certification.expiry_date).toISOString().split("T")[0]
          : "",
        status: certification?.status || "active",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        tenantId: isSuperAdmin ? "" : tenentId?.toString() || "",
        status: "active",
      }));
    }
  }, [certification, certificateId, isSuperAdmin, tenentId]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Clear certification validation error when user makes relevant changes
    if (name === "assessmentRequired" || name === "trainingIds") {
      setErrors((prev) => ({ ...prev, certificationValidation: "" }));
    }

    // Reset trainings when tenant changes
    if (name === "tenantId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        trainingIds: [],
      }));
      setOriginalTrainingIds([]);
    }
  };

  // Dynamic training options from API (filtered by current tenant)
  const currentTenantId = isSuperAdmin
    ? formData.tenantId
    : tenentId?.toString();

  // Combined loading state for training operations
  const isTrainingLoading = useMemo(() => {
    // Only show loading for initial fetch, not for search operations
    return trainingLoading && !trainingSearchQuery;
  }, [trainingLoading, trainingSearchQuery]);

  const trainingOptions = useMemo(() => {
    if (!trainingData?.content?.data) return [];

    const filteredTrainings = trainingData.content.data
      .filter((training) =>
        isSuperAdmin ? true : training.tenantId.toString() === currentTenantId
      )
      .map((training) => ({
        label: training.trainingName,
        value: training.id.toString(),
        tenantId: training.tenantId,
      }));

    // Ensure selected training IDs are always included in options
    const selectedTrainingIds = formData.trainingIds || [];

    // If we have selected IDs that aren't in the current filtered results,
    // we need to preserve them (this happens during search)
    const missingSelectedOptions = selectedTrainingIds
      .filter((id) => !filteredTrainings.some((option) => option.value === id))
      .map((id) => {
        // Find the training data for this ID from the original data
        const trainingRecord = trainingData?.content?.data?.find(
          (t) => t.id.toString() === id
        );
        return trainingRecord
          ? {
              label: trainingRecord.trainingName,
              value: trainingRecord.id.toString(),
              tenantId: trainingRecord.tenantId,
            }
          : null;
      })
      .filter(
        (option): option is NonNullable<typeof option> => option !== null
      );

    return [...filteredTrainings, ...missingSelectedOptions];
  }, [
    trainingData?.content?.data,
    isSuperAdmin,
    currentTenantId,
    formData.trainingIds,
  ]);

  // Process validation errors and update the state
  const handleValidationError = (error: {
    inner: Array<{ path: string; message: string }>;
  }) => {
    const validationErrors: Record<string, string> = {};
    error.inner.forEach((err) => {
      validationErrors[err.path] = err.message;
    });
    setErrors(validationErrors);
  };

  const handleSubmit = async () => {
    dispatch(startLoading());
    try {
      // Light validation (schema references removed fields)
      const v: FormErrorType = {};
      if (!formData.title?.trim()) v.title = "Title is required";
      if (!formData.description?.trim())
        v.description = "Description is required";
      if (!formData.status?.trim()) v.status = "Status is required";
      if (formData.assessmentRequired === "yes") {
        if (!formData.assessmentTime?.trim())
          v.assessmentTime = "Assessment time is required";
        if (!formData.passPercentage?.trim())
          v.passPercentage = "Pass percentage is required";
      }
      if (formData.recurring === "yes") {
        if (!formData.interval_unit?.trim())
          v.interval_unit = "Interval unit is required";
        if (!formData.interval_value?.trim())
          v.interval_value = "Interval value is required";
      }

      // Validate that certificate has at least one of Trainings or Assessment
      const hasTrainings =
        formData.trainingIds && formData.trainingIds.length > 0;
      const hasAssessment = formData.assessmentRequired === "yes";

      if (!hasTrainings && !hasAssessment) {
        v.certificationValidation =
          "Certificate must have at least one Training linked or Assessment enabled";
      }
      setErrors(v);
      if (Object.keys(v).length > 0) {
        throw {
          name: "ValidationError",
          inner: Object.keys(v).map((k) => ({ path: k, message: v[k] })),
        };
      }

      const formDataToSend: FormDataToSendType = {};

      if (certificateId) {
        // Update mode - only send fields that can be updated
        formDataToSend.title = formData.title;
        formDataToSend.status = formData.status;
        formDataToSend.isAssessmentRequired =
          formData.assessmentRequired === "yes";
        // Ensure feedbackRequired is respected on update
        formDataToSend.isFeedbackRequired =
          formData.feedbackRequired === "yes";
        formDataToSend.isRecurring = formData.recurring === "yes";

        // Handle interval fields based on recurring status for updates
        if (formData.recurring === "yes") {
          formDataToSend.interval_unit = formData.interval_unit;
          formDataToSend.interval_value = formData.interval_value
            ? parseInt(formData.interval_value)
            : undefined;
        } else {
          // Set to null when recurring is false (matching backend logic)
          formDataToSend.interval_unit = null;
          formDataToSend.interval_value = null;
        }

        if (formData.assessmentTime) {
          formDataToSend.assessmentTime = parseInt(formData.assessmentTime);
        }
        if (formData.passPercentage) {
          formDataToSend.passPercentage = formData.passPercentage;
        }
      } else {
        // Create mode - send all fields
        formDataToSend.title = formData.title;
        formDataToSend.description = formData.description;
        formDataToSend.status = formData.status;
        formDataToSend.isRecurring = formData.recurring === "yes";

        // Handle interval fields based on recurring status
        if (formData.recurring === "yes") {
          formDataToSend.interval_unit = formData.interval_unit;
          formDataToSend.interval_value = formData.interval_value
            ? parseInt(formData.interval_value)
            : undefined;
        } else {
          // Set to null when recurring is false (matching backend logic)
          formDataToSend.interval_unit = null;
          formDataToSend.interval_value = null;
        }

        formDataToSend.tenantId = formData.tenantId || undefined;
        formDataToSend.expiry_date = formData.expiry_date
          ? new Date(formData.expiry_date).toISOString()
          : undefined;
        formDataToSend.isAssessmentRequired =
          formData.assessmentRequired === "yes";
        // Send feedbackRequired on create as well
        formDataToSend.isFeedbackRequired =
          formData.feedbackRequired === "yes";
        formDataToSend.assessmentTime = formData.assessmentTime
          ? parseInt(formData.assessmentTime)
          : undefined;
        formDataToSend.passPercentage = formData.passPercentage;
      }

      // Handle training IDs based on create vs update mode
      if (certificateId) {
        // Update mode: calculate added and removed training IDs
        const currentTrainingIds = formData.trainingIds.map((id) =>
          parseInt(id)
        );
        const originalTrainingIdsNums = originalTrainingIds.map((id) =>
          parseInt(id)
        );

        const updateTrainingIds = currentTrainingIds.filter(
          (id) => !originalTrainingIdsNums.includes(id)
        );
        const removeTrainingIds = originalTrainingIdsNums.filter(
          (id) => !currentTrainingIds.includes(id)
        );

        // Only include training ID arrays if they have values
        if (updateTrainingIds.length > 0) {
          formDataToSend.updateTrainingIds = updateTrainingIds;
        }
        if (removeTrainingIds.length > 0) {
          formDataToSend.removeTrainingIds = removeTrainingIds;
        }

        console.log("Final update payload:", formDataToSend);
      } else {
        // Create mode: send all training IDs
        formDataToSend.trainingIds = formData.trainingIds.map((id) =>
          parseInt(id)
        );
        console.log("Create mode - Training IDs:", formDataToSend.trainingIds);
      }

      if (certificateId) {
        // Update mode
        await updateCertificationApiFunction({
          formData: formDataToSend,
          certificateId,
        });
      } else {
        // Create mode
        await CreateCertificationApiFunction({ formData: formDataToSend });
      }
      setModalOpen(true);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ValidationError" &&
        "inner" in error
      ) {
        handleValidationError(
          error as { inner: Array<{ path: string; message: string }> }
        );
      } else {
        setIsErrorModelOpen(true);
        // Prefer backend validation details when available
        let errorMessage = "Network Error";
        if (error && typeof error === "object" && "response" in error) {
          const data = (error.response as { data?: any })?.data;
          if (data) {
            if (Array.isArray(data.errors) && data.errors.length > 0) {
              errorMessage = data.errors.join(" | ");
            } else if (typeof data.message === "string" && data.message) {
              errorMessage = data.message;
            }
          }
        } else if (error && typeof error === "object" && "message" in error) {
          errorMessage = (error as { message: string }).message || errorMessage;
        }
        setErrors({
          apiError: errorMessage,
        });
      }
    } finally {
      dispatch(stopLoading());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        path="Certification"
        subPath={`${certificateId ? "Edit" : "Create"} Certification`}
      />

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 -mt-2 ">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />

          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            {`${certificateId ? "Edit" : "Create"}`} Certification
          </h1>
        </div>

        <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-md overflow-hidden">
          {/* Display general validation error */}
          {errors.certificationValidation && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    {errors.certificationValidation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isSuperAdmin && (
                <SelectField
                  label="Select Company"
                  name="tenantId"
                  required
                  value={formData.tenantId || ""}
                  onChange={handleChange}
                  error={errors.tenantId}
                  options={companyOptions.map((c) => ({
                    label: c.name,
                    value: String(c.id),
                  }))}
                  className="col-span-2"
                  isSearchable
                  disabled={Boolean(certificateId)}
                  isInfiniteScroll
                  onSearch={handleCompanySearch}
                  onLoadMore={handleCompanyLoadMore}
                  loading={companyLoading}
                  customDropdown={true}
                />
              )}

              {/* Title and Trainings row */}
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="Title"
                    placeholder="Title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    maxLength={200}
                  />

                  {/* Trainings field - always visible */}
                  <SelectField
                    label="Trainings"
                    name="trainingIds"
                    value={formData.trainingIds}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        trainingIds: Array.isArray(e.target.value)
                          ? e.target.value.map(String)
                          : [],
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        trainingIds: "",
                        certificationValidation: "", // Clear validation error when trainings change
                      }));
                    }}
                    options={trainingOptions}
                    error={errors.trainingIds}
                    placeholder={
                      isTrainingLoading
                        ? "Loading trainings..."
                        : "Link Trainings (at least one Training or Assessment required)"
                    }
                    disabled={
                      (isSuperAdmin && !formData.tenantId) ||
                      (!isSuperAdmin && !currentTenantId) ||
                      isTrainingLoading
                    }
                    loading={isTrainingLoading}
                    customDropdown={true}
                    isMultiSelect={true}
                    isSearchable={true}
                    isInfiniteScroll={true}
                    onSearch={handleTrainingSearch}
                    onLoadMore={handleTrainingLoadMore}
                  />
                </div>
              </div>

              {/* Status, Assessment Required, Feedback Required, and Recurring row */}
              <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  {/* Status toggle */}
                  <div className="flex flex-col gap-1 md:gap-0.5">
                    <label className="text-sm text-gray-700 font-medium">
                      Status{" "}
                      {errors.status && (
                        <span className="text-orange-500">*</span>
                      )}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-pressed={formData.status === "active"}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            status:
                              prev.status === "active" ? "inactive" : "active",
                          }))
                        }
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 ease-out focus:outline-none border shadow-sm hover:shadow ${
                          formData.status === "active"
                            ? "bg-primary border-primary"
                            : "bg-gray-200 border-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            formData.status === "active"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                        <span className="sr-only">Toggle status</span>
                      </button>
                      <span className="text-xs text-gray-500 capitalize">
                        {formData.status || "inactive"}
                      </span>
                    </div>
                    {errors.status && (
                      <span className="text-xs text-orange-500">
                        {errors.status}
                      </span>
                    )}
                  </div>
                  {/* Feedback Required toggle */}
                  <div className="flex flex-col gap-1 md:gap-0.5">
                    <label className="text-sm text-gray-700 font-medium">
                      Feedback Required?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-pressed={formData.feedbackRequired === "yes"}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            feedbackRequired:
                              prev.feedbackRequired === "yes" ? "no" : "yes",
                          }))
                        }
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 ease-out focus:outline-none border shadow-sm hover:shadow ${
                          formData.feedbackRequired === "yes"
                            ? "bg-primary border-primary"
                            : "bg-gray-200 border-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            formData.feedbackRequired === "yes"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                        <span className="sr-only">
                          Toggle feedback required
                        </span>
                      </button>
                      <span className="text-xs text-gray-500">
                        {formData.feedbackRequired === "yes" ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  {/* Assessment Required toggle */}
                  <div className="flex flex-col gap-1 md:gap-0.5">
                    <label className="text-sm text-gray-700 font-medium">
                      Assessment Required?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-pressed={formData.assessmentRequired === "yes"}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            assessmentRequired:
                              prev.assessmentRequired === "yes" ? "no" : "yes",
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            certificationValidation: "", // Clear validation error when assessment toggle changes
                          }));
                        }}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 ease-out focus:outline-none border shadow-sm hover:shadow ${
                          formData.assessmentRequired === "yes"
                            ? "bg-primary border-primary"
                            : "bg-gray-200 border-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            formData.assessmentRequired === "yes"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                        <span className="sr-only">
                          Toggle assessment required
                        </span>
                      </button>
                      <span className="text-xs text-gray-500">
                        {formData.assessmentRequired === "yes" ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  {/* Recurring toggle */}
                  <div className="flex flex-col gap-1 md:gap-0.5">
                    <label className="text-sm text-gray-700 font-medium">
                      Recurring?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-pressed={formData.recurring === "yes"}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            recurring: prev.recurring === "yes" ? "no" : "yes",
                            // Clear interval fields when turning off recurring
                            ...(prev.recurring === "yes" && {
                              interval_unit: "",
                              interval_value: "",
                            }),
                          }))
                        }
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 ease-out focus:outline-none border shadow-sm hover:shadow ${
                          formData.recurring === "yes"
                            ? "bg-primary border-primary"
                            : "bg-gray-200 border-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            formData.recurring === "yes"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                        <span className="sr-only">Toggle recurring</span>
                      </button>
                      <span className="text-xs text-gray-500">
                        {formData.recurring === "yes" ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment fields - show when assessment required */}
              {formData.assessmentRequired === "yes" && (
                <div className="col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="transition-all duration-200 ease-out">
                      <TextField
                        label="Assessment Time (Minutes)"
                        placeholder="Assessment Time"
                        name="assessmentTime"
                        required
                        value={formData.assessmentTime}
                        onChange={handleChange}
                        error={errors.assessmentTime}
                      />
                    </div>
                    <div className="transition-all duration-200 ease-out">
                      <TextField
                        label="Pass Percentage"
                        name="passPercentage"
                        placeholder="Pass Percentage"
                        required
                        value={formData.passPercentage}
                        onChange={handleChange}
                        error={errors.passPercentage}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Interval fields - show when recurring is enabled */}
              {formData.recurring === "yes" && (
                <div className="col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="transition-all duration-200 ease-out">
                      <SelectField
                        label="Interval Unit"
                        name="interval_unit"
                        value={formData.interval_unit}
                        onChange={handleChange}
                        error={errors.interval_unit}
                        options={[
                          // { label: "Days", value: "days" },
                          // { label: "Weeks", value: "weeks" },
                          { label: "Months", value: "months" },
                          { label: "Years", value: "years" },
                        ]}
                        placeholder="Select Interval Type"
                        required
                      />
                    </div>
                    <div className="transition-all duration-200 ease-out">
                      <TextField
                        label="Interval Value"
                        name="interval_value"
                        value={formData.interval_value}
                        onChange={handleChange}
                        error={errors.interval_value}
                        placeholder="Interval Value"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Expiry Date field */}

              {/* 
              
               <div className="col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <DateField
                    label="Certificate Expiry Date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    error={errors.expiry_date}
                    placeholder="Expiry Date"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              */}

              {/* Description field below */}
              <TextAreaField
                label="Description"
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                error={errors.description}
                maxLength={500}
                className="col-span-2"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
              <ButtonSecondary text="Cancel" onClick={() => navigate(-1)} />
              <ButtonPrimary text="Submit" type="submit" />
            </div>
          </form>
        </main>
      </div>

      <SuccessModal
        isOpen={isModalOpen}
        title={`Certification ${
          certificateId ? "Updated" : "Created"
        } Successfully`}
        subtitle="Your certification details have been saved."
        onCancel={() => {
          setModalOpen(false);
          navigate(-1);
        }}
        onConfirm={() => {
          setModalOpen(false);
          navigate(-1);
        }}
        onClose={() => setModalOpen(false)}
      />

      <ErrorModal
        isOpen={isErrorModelOpen}
        title={errors.apiError || `Error While Uploading Certification`}
        onCancel={() => setIsErrorModelOpen(false)}
        onClose={() => setIsErrorModelOpen(false)}
      />
    </div>
  );
};

export default CreateUpdateCertifications;
