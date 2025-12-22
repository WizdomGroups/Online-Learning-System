import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import debounce from "lodash/debounce";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import TextAreaField from "../../components/TextAreaField";
// import MultiSelectField from "../../components/MultiSelectField";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import { fetchModuleData } from "../../lib/network/moduleApi";
import {
  createTrainingApiFunction,
  updateTrainingApiFunction,
  fetchTrainingById,
  ApiError,
} from "../../lib/network/trainingApi";
import { Module } from "../../lib/types/module";
import { RootState } from "../../store";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";

interface OptionType {
  label: string;
  value: string;
}

const CreateUpdateTraining: React.FC = () => {
  const { tenentId, isSuperAdmin } = useLocalStorageUserData();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { data: moduleData } = useSelector((state: RootState) => state.module);

  // Get training ID from URL params to determine if this is edit mode
  const trainingId = searchParams.get("id");
  const isEditMode = Boolean(trainingId);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [modules, setModules] = useState<string[]>([]);
  const [originalModules, setOriginalModules] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTraining, setIsLoadingTraining] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  // Module search and pagination state
  const [moduleSearchQuery, setModuleSearchQuery] = useState("");
  const [modulePage, setModulePage] = useState(1);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleHasMore, setModuleHasMore] = useState(true);
  const [existingModuleOptions, setExistingModuleOptions] = useState<
    OptionType[]
  >([]);

  // Fetch modules with search and pagination
  const fetchModules = useCallback(
    async (search = "", page = 1): Promise<void> => {
      const tenantToUse = isSuperAdmin ? "" : tenentId?.toString() || "";

      if (!tenantToUse) {
        return;
      }

      setModuleLoading(true);
      try {
        const response = await dispatch(
          fetchModuleData({
            limit: 20,
            page,
            searchQuery: search,
            status: "active",
            tenantId: tenantToUse,
          })
        );

        // Extract modules from the response
        let moduleList: Module[] = [];
        if (
          response?.payload &&
          typeof response.payload === "object" &&
          "content" in response.payload &&
          response.payload.content &&
          typeof response.payload.content === "object" &&
          "data" in response.payload.content &&
          response.payload.content.data &&
          typeof response.payload.content.data === "object" &&
          "data" in response.payload.content.data &&
          Array.isArray(
            (response.payload as { content: { data: { data: Module[] } } })
              .content.data.data
          )
        ) {
          moduleList = (
            response.payload as { content: { data: { data: Module[] } } }
          ).content.data.data;
        }

        setModuleHasMore(moduleList.length >= 20);

        // The moduleOptions useMemo will automatically update with the new data from Redux
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setModuleLoading(false);
      }
    },
    [dispatch, isSuperAdmin, tenentId]
  );

  // Debounced module search handler
  const debouncedModuleSearch = useMemo(
    () =>
      debounce((query: string) => {
        setModuleSearchQuery(query);
        setModulePage(1);
        fetchModules(query, 1);
      }, 300),
    [fetchModules]
  );

  // Handle module search
  const handleModuleSearch = (query: string) => {
    debouncedModuleSearch(query);
  };

  // Handle module load more
  const handleModuleLoadMore = () => {
    if (moduleHasMore && !moduleLoading) {
      const nextPage = modulePage + 1;
      setModulePage(nextPage);
      fetchModules(moduleSearchQuery, nextPage);
    }
  };

  // Fetch modules on component mount
  useEffect(() => {
    fetchModules("", 1);
  }, [fetchModules]);

  // Fetch training data when in edit mode
  useEffect(() => {
    if (isEditMode && trainingId) {
      const fetchTrainingData = async () => {
        try {
          setIsLoadingTraining(true);
          setApiError("");

          const response = await fetchTrainingById(trainingId);

          if (response && response.content && response.content.data) {
            const trainingData = response.content.data;

            // Prepopulate form fields
            setName(trainingData.trainingName || "");
            setCode(trainingData.trainingCode || "");
            setDescription(trainingData.description || "");
            setStatus(trainingData.status || "active");

            // Prepopulate modules
            if (
              (
                trainingData as {
                  Modules?: Array<{ id: number | string; name: string }>;
                }
              ).Modules &&
              Array.isArray(
                (
                  trainingData as {
                    Modules: Array<{ id: number | string; name: string }>;
                  }
                ).Modules
              )
            ) {
              const modulesFromResponse = (
                trainingData as {
                  Modules: Array<{ id: number | string; name: string }>;
                }
              ).Modules;

              // Set selected module IDs
              const selectedModuleIds = modulesFromResponse.map(
                (module: { id: number | string }) => module.id.toString()
              );
              setModules(selectedModuleIds);
              setOriginalModules(selectedModuleIds); // Store original modules for comparison

              // Set existing module options to ensure they're always visible in dropdown
              const existingModules = modulesFromResponse.map(
                (module: { id: number | string; name: string }) => ({
                  label: module.name,
                  value: module.id.toString(),
                })
              );
              setExistingModuleOptions(existingModules);
            }
          }
        } catch (error) {
          console.error("Error fetching training data:", error);

          if (error instanceof Error) {
            if ("status" in error) {
              const apiError = error as ApiError;
              setApiError(apiError.message);
            } else {
              setApiError(error.message || "Failed to load training data");
            }
          } else {
            setApiError("Failed to load training data");
          }
        } finally {
          setIsLoadingTraining(false);
        }
      };

      fetchTrainingData();
    }
  }, [isEditMode, trainingId]);

  const moduleOptions = useMemo<OptionType[]>(() => {
    const fetchedModules: OptionType[] = [];

    // Add modules from Redux state (fetched via pagination)
    if (Array.isArray(moduleData?.content?.data?.data)) {
      const reduxModules = moduleData.content.data.data.map(
        (module: Module) => ({
          label: module.name,
          value: module.id.toString(),
        })
      );
      fetchedModules.push(...reduxModules);
    }

    // Add existing modules from training response (to ensure they're always visible)
    const combinedModules = [...existingModuleOptions, ...fetchedModules];

    // Remove duplicates based on value
    const uniqueModules = combinedModules.filter(
      (module, index, self) =>
        index === self.findIndex((m) => m.value === module.value)
    );

    return uniqueModules;
  }, [moduleData, existingModuleOptions]);

  const validate = () => {
    const v: Record<string, string> = {};
    if (!name.trim()) v.name = "Training name is required";
    if (!code.trim()) v.code = "Training code is required";
    if (!description.trim()) v.description = "Description is required";
    if (modules.length === 0) v.modules = "Select at least one module";
    setErrors(v);
    return Object.keys(v).length === 0;
  };

  // Calculate module differences for update API
  const calculateModuleDifferences = () => {
    const currentModuleIds = modules.map((moduleId) => parseInt(moduleId));
    const originalModuleIds = originalModules.map((moduleId) =>
      parseInt(moduleId)
    );

    // Find modules to add (in current but not in original)
    const updateModuleIds = currentModuleIds.filter(
      (id) => !originalModuleIds.includes(id)
    );

    // Find modules to remove (in original but not in current)
    const removeModuleIds = originalModuleIds.filter(
      (id) => !currentModuleIds.includes(id)
    );

    return { updateModuleIds, removeModuleIds };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError("");

    try {
      let trainingData;
      let response;

      if (isEditMode && trainingId) {
        // Update existing training - use the new PUT API structure
        const { updateModuleIds, removeModuleIds } =
          calculateModuleDifferences();

        trainingData = {
          trainingName: name,
          trainingCode: code,
          description: description,
          status: status,
          updateModuleIds: updateModuleIds,
          removeModuleIds: removeModuleIds,
          tenantId: tenentId,
        };

        response = await updateTrainingApiFunction(trainingId, trainingData);
      } else {
        // Create new training - use the original structure
        trainingData = {
          trainingName: name,
          trainingCode: code,
          description: description,
          moduleIds: modules.map((moduleId) => parseInt(moduleId)),
          tenantId: tenentId,
        };

        response = await createTrainingApiFunction(trainingData);
      }

      // Check if the response indicates success
      if (
        response &&
        (response.code === 200 || response.code === 201 || !response.error)
      ) {
        setIsOpen(true);

        // Only reset form after successful creation (not update)
        if (!isEditMode) {
          setName("");
          setCode("");
          setDescription("");
          setStatus("active");
          setModules([]);
          setOriginalModules([]);
          setExistingModuleOptions([]);
          setErrors({});
        }
      } else {
        // Handle API response errors
        setApiError(
          response.message ||
            response.exception ||
            `Failed to ${isEditMode ? "update" : "create"} training`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} training:`,
        error
      );

      // Handle different types of errors
      if (error instanceof Error) {
        // Check if it's our custom ApiError
        if ("status" in error) {
          const apiError = error as ApiError;
          setApiError(apiError.message);

          // Handle specific status codes in the UI
          if (apiError.status === 401) {
            // Token might be expired, but axios interceptor should handle logout
            console.warn("Authentication error - user should be logged out");
          } else if (apiError.status === 403) {
            // Permission denied
            console.warn(
              `Permission denied for training ${
                isEditMode ? "update" : "creation"
              }`
            );
          } else if (apiError.status === 409) {
            // Conflict - training code already exists
            console.warn("Training code already exists");
          }
        } else {
          // Generic error
          setApiError(
            error.message || "An unexpected error occurred. Please try again."
          );
        }
      } else {
        // Unknown error type
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Breadcrumb
        path="Trainings"
        subPath={isEditMode ? "Update Training" : "Create Training"}
      />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 -mt-2 ">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            {isEditMode ? "Update Training" : "Create Training"}
          </h1>
        </div>

        <main className="bg-white p-4 sm:p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
          {isLoadingTraining ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading training data...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Training Name"
                  placeholder="Enter training name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  error={errors.name}
                  className="col-span-2"
                  maxLength={200}
                />

                <TextField
                  label="Training Code"
                  placeholder="Enter training code"
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (errors.code) setErrors((p) => ({ ...p, code: "" }));
                  }}
                  error={errors.code}
                  className="col-span-2 md:col-span-1"
                  maxLength={50}
                />

                {isEditMode && (
                  <SelectField
                    label="Status"
                    name="status"
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="col-span-2 md:col-span-1"
                  />
                )}

                <SelectField
                  label="Modules"
                  name="modules"
                  options={moduleOptions}
                  value={modules}
                  onChange={(e) => {
                    setModules(
                      Array.isArray(e.target.value) ? e.target.value : []
                    );
                    if (errors.modules)
                      setErrors((p) => ({ ...p, modules: "" }));
                  }}
                  placeholder="Select modules..."
                  required
                  error={errors.modules}
                  className="col-span-2 md:col-span-1"
                  isMultiSelect={true}
                  isSearchable={true}
                  isInfiniteScroll={true}
                  onSearch={handleModuleSearch}
                  onLoadMore={handleModuleLoadMore}
                  loading={moduleLoading}
                  customDropdown={true}
                />

                <TextAreaField
                  label="Description"
                  placeholder="Enter description"
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description)
                      setErrors((p) => ({ ...p, description: "" }));
                  }}
                  error={errors.description}
                  className="col-span-2"
                  maxLength={500}
                />

                {apiError && (
                  <div className="col-span-2 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
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
                        <p className="text-red-600 text-sm font-medium">
                          Error
                        </p>
                        <p className="text-red-600 text-sm mt-1">{apiError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <SuccessModal
                  isOpen={isOpen}
                  title={isEditMode ? "Training Updated" : "Training Created"}
                  subtitle={
                    isEditMode
                      ? "Training has been updated successfully."
                      : "Training has been created successfully."
                  }
                  onCancel={() => setIsOpen(false)}
                  onConfirm={() => {
                    setIsOpen(false);
                    navigate(-1); // Go back to previous page
                  }}
                  onClose={() => setIsOpen(false)}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
                {!isEditMode && (
                  <ButtonSecondary
                    text="Reset"
                    onClick={() => {
                      // In create mode, clear the form
                      setName("");
                      setCode("");
                      setDescription("");
                      setStatus("active");
                      setModules([]);
                      setOriginalModules([]);
                      setExistingModuleOptions([]);
                      setErrors({});
                    }}
                  />
                )}
                <ButtonPrimary
                  type="submit"
                  text={
                    isLoading
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update"
                      : "Submit"
                  }
                  disabled={isLoading}
                />
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default CreateUpdateTraining;
