import React, { useEffect, useState, useCallback, useMemo } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import Tabs from "../../components/Tabs";
import SearchField from "../../components/SearchField";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { fetchEmployeeData } from "../../lib/network/employeeApis";
import DynamicTable from "../../components/DynamicTable";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import useDebounce from "../../lib/hooks/useDebounce";
import { fetchCertificationDateApiFunction } from "../../lib/network/certificationApi";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { certificationTransactionSchema } from "../../lib/ValidationsSchema";
import { CreateCertificationTransactionApiFunction } from "../../lib/network/certificationTransactionApis";
import ErrorModal from "../../components/ErrorModal";
import MultiSelectField from "../../components/MultiSelectField";
import { fetchDepartmentApiFunction } from "../../lib/network/departmentApis";
import { useNavigate } from "react-router-dom";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import { Company } from "../../lib/interface/company";
import debounce from "lodash/debounce";

export interface FormDataType {
  companyId: number | string;
  certificationId: number | string;
  status: "Assigned" | "Completed" | "InProgress" | "Pending";
  certificationResult: "Pending" | "Pass" | "Fail";
  assignedBy: number;
  assignedDate: string;
  completedDate: string | null;
  documentReadStatus: boolean;
  feedbackGiven: boolean;
  attempts: number;
  trainer: number;
  assessmentAnswerId: number | null;
  version: string;
  remark: string;
}

interface FormErrorType {
  [key: string]: string;
}

// Add this interface for selected user data
interface SelectedUserType {
  companyId: number;
  employeeId: number;
  employeeName: string;
  certificationId: number | string;
  status: string;
  certificationResult: string;
  departmentId: number;
  department: string;
  designationId: number;
  designation: string;
  assignedBy: number;
  assignedDate: string;
  completedDate: null;
  documentReadStatus: boolean;
  startDate: null;
  endDate: null;
  feedbackGiven: boolean;
  attempts: number;
  trainer: number;
  version: string;
  remark: string;
}

interface OptionType {
  label: string;
  value: string;
}

// Minimal type for employee record
interface EmployeeRecord {
  id: number;
  firstName: string;
  lastName: string;
  departmentId: number;
  designationId: number;
  DepartmentModel?: { name?: string };
  DesignationModel?: { name?: string };
  MasterRoleModel?: { name?: string };
  [key: string]: unknown;
}

const AssignCertifications: React.FC = () => {
  const { tenentId, employeeId, isSuperAdmin } = useLocalStorageUserData();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [companyOptions, setCompanyOptions] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

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

  // Debounced certification search handler
  const debouncedCertificationSearch = useMemo(
    () =>
      debounce((query: string, tenantId: string) => {
        setIsSearchingCertifications(true);
        const payload: {
          pageSize: number;
          page: number;
          status: string;
          tenantId: string;
          searchQuery?: string;
        } = {
          pageSize: 20,
          page: 1,
          status: "active",
          tenantId: tenantId,
        };

        // Only add search parameter if query is not empty
        if (query && query.trim()) {
          payload.searchQuery = query;
        }

        dispatch(fetchCertificationDateApiFunction(payload)).finally(() => {
          setIsSearchingCertifications(false);
        });
      }, 300),
    [dispatch]
  );

  // Handle certification search
  const handleCertificationSearch = (query: string) => {
    setCertificationSearchQuery(query);
    setCertificationPage(1);

    if (selectedCompanyId) {
      debouncedCertificationSearch(query, selectedCompanyId);
    }
  };

  // Handle certification load more
  const handleCertificationLoadMore = () => {
    if (
      certificationHasMore &&
      !isSearchingCertifications &&
      selectedCompanyId
    ) {
      const nextPage = certificationPage + 1;
      setCertificationPage(nextPage);
      setIsSearchingCertifications(true);

      const payload: {
        pageSize: number;
        page: number;
        status: string;
        tenantId: string;
        searchQuery?: string;
      } = {
        pageSize: 20,
        page: nextPage,
        status: "active",
        tenantId: selectedCompanyId,
      };

      // Only add search parameter if query is not empty
      if (certificationSearchQuery && certificationSearchQuery.trim()) {
        payload.searchQuery = certificationSearchQuery;
      }

      dispatch(fetchCertificationDateApiFunction(payload)).finally(() => {
        setIsSearchingCertifications(false);
      });
    }
  };

  const [activeTab, setActiveTab] = useState("Users");

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    isSuperAdmin ? "" : tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [formData, setFormData] = useState<FormDataType>({
    companyId: isSuperAdmin ? "" : tenentId,
    certificationId: "",
    status: "Assigned",
    certificationResult: "Pending",
    assignedBy: employeeId,
    assignedDate: new Date().toISOString(),
    completedDate: null,
    documentReadStatus: false,
    feedbackGiven: false,
    attempts: 1,
    trainer: employeeId,
    assessmentAnswerId: null,
    version: "v1",
    remark: "",
  });

  const [errors, setErrors] = useState<FormErrorType>({});

  const [isModalOpen, setModalOpen] = useState(false);
  const [isErrorModelOpen, setIsErrorModelOpen] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Update certificationId for all selected users when certification changes
    if (name === "certificationId") {
      setSelectedUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          certificationId: value,
        }))
      );
    }

    // Update companyId when company selection changes
    if (name === "companyId") {
      setSelectedCompanyId(value);
      setFormData((prev) => ({ ...prev, companyId: value }));

      // Reset employee selection and certification when company changes
      setSelectedIds([]);
      setSelectedUsers([]);
      setFormData((prev) => ({
        ...prev,
        companyId: value,
        certificationId: "", // Reset certification selection
      }));

      // Clear search and department filters
      setSearchQuery("");
      setSelectedDepartments([]);
      setPage(1); // Reset to first page
    }
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Add state for selected users
  const [selectedUsers, setSelectedUsers] = useState<SelectedUserType[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Certification search and pagination state
  const [certificationSearchQuery, setCertificationSearchQuery] = useState("");
  const [certificationPage, setCertificationPage] = useState(1);
  const [certificationHasMore, setCertificationHasMore] = useState(true);
  const [isSearchingCertifications, setIsSearchingCertifications] =
    useState(false);

  const tabItems = [
    { label: "Users", value: "Users" },
    {
      label: `${selectedIds.length > 0
          ? `Selected Users (${selectedIds.length})`
          : "Selected Users"
        }`,
      value: "Selected Users",
    },
    // { label: "User Groups", value: "userGroups" },
    // { label: "Roles", value: "roles" },
  ];

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSelectedIds = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];

      // Update selected users when selection changes
      const selectedUser = usersList.find((user) => String(user.id) === id); // Changed this line
      if (selectedUser) {
        if (prev.includes(id)) {
          // Remove user from selected users
          setSelectedUsers((prevUsers) =>
            prevUsers.filter((u) => String(u.employeeId) !== id)
          );
        } else {
          // Add user to selected users
          const newSelectedUser: SelectedUserType = {
            companyId: formData.companyId as number,
            employeeId: selectedUser.id,
            employeeName: `${selectedUser.firstName} ${selectedUser.lastName}`,
            certificationId: formData.certificationId,
            status: formData.status,
            certificationResult: formData.certificationResult,
            departmentId: selectedUser.departmentId,
            department: selectedUser.DepartmentModel?.name || "",
            designationId: selectedUser.designationId,
            designation: selectedUser.DesignationModel?.name || "",
            assignedBy: formData.assignedBy,
            assignedDate: formData.assignedDate,
            completedDate: null,
            startDate: null,
            endDate: null,
            documentReadStatus: formData.documentReadStatus,
            feedbackGiven: formData.feedbackGiven,
            attempts: formData.attempts,
            trainer: formData.trainer,
            version: formData.version,
            remark: formData.remark,
          };
          setSelectedUsers((prevUsers) => [...prevUsers, newSelectedUser]);
        }
      }
      return newSelectedIds;
    });

    //remove validation error from state

    setErrors((prev) => ({ ...prev, selectedIds: "" }));
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: () => {
        return (
          <div>
            <div className="relative w-10 h-10">
              <img
                src={"/images/user-dummy-profile.svg"}
                alt="img"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
          </div>
        );
      },
    },
    {
      key: "firstName",
      label: "Name",
      render: (_value: string, record: EmployeeRecord) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {`${record.firstName} ${record.lastName}`}
          </span>
        );
      },
    },
    {
      key: "department",
      label: "Department",
      render: (_value: string, record: EmployeeRecord) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record.DepartmentModel?.name || "N/A"}
          </span>
        );
      },
    },
    {
      key: "designation",
      label: "Designation",
      render: (_value: string, record: EmployeeRecord) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record.DesignationModel?.name || "N/A"}
          </span>
        );
      },
    },
    {
      key: "role",
      label: "Role",
      render: (_value: string, record: EmployeeRecord) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record.MasterRoleModel?.name || "N/A"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, record: EmployeeRecord) => {
        return (
          <div>
            <input
              type="checkbox"
              checked={selectedIds.includes(String(record.id))}
              onChange={() => toggleSelection(String(record.id))}
              className="w-4 h-4 border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        );
      },
    },
  ];

  // Fetch certifications based on selected company with pagination
  useEffect(() => {
    if (selectedCompanyId && selectedCompanyId !== "") {
      // Reset certification search and pagination when company changes
      setCertificationSearchQuery("");
      setCertificationPage(1);
      setCertificationHasMore(true);

      const payload = {
        pageSize: 20,
        page: 1,
        status: "active",
        tenantId: selectedCompanyId,
      };

      dispatch(fetchCertificationDateApiFunction(payload));
    }
  }, [dispatch, selectedCompanyId]);

  // Fetch departments based on selected company
  useEffect(() => {
    if (selectedCompanyId && selectedCompanyId !== "") {
      dispatch(
        fetchDepartmentApiFunction({
          limit: 100,
          page: 1,
          status: "active",
          tenantId: selectedCompanyId,
        })
      );
    }
  }, [dispatch, selectedCompanyId]);

  // Fetch employees based on selected company and other filters
  useEffect(() => {
    if (selectedCompanyId && selectedCompanyId !== "") {
      dispatch(
        fetchEmployeeData({
          page: Number(page),
          limit: Number(pageSize),
          searchQuery: debouncedSearchQuery,
          departmentIds: selectedDepartments.join(","),
          tenantId: selectedCompanyId,
        })
      );
    }
  }, [
    dispatch,
    page,
    pageSize,
    debouncedSearchQuery,
    selectedDepartments,
    selectedCompanyId,
  ]);

  const { data, error } = useSelector((state: RootState) => state.employees);

  const pagination: { total?: number } = data?.content?.pagination || {
    total: 0,
  };
  const usersList = data?.content?.data || [];

  const { data: certificationData, loading: certificationLoading } =
    useSelector((state: RootState) => state.certification);

  // Handle certification data updates and pagination
  useEffect(() => {
    if (certificationData?.content?.data) {
      const certifications = certificationData.content.data;
      // Check if we have more pages based on the number of items returned
      // If we get less than the limit, we've reached the end
      setCertificationHasMore(certifications.length >= 20);
    }
  }, [certificationData]);

  // Combined loading state for certification operations
  const isCertificationLoading = useMemo(() => {
    // Only show loading for initial fetch, not for search operations
    return certificationLoading && !certificationSearchQuery;
  }, [certificationLoading, certificationSearchQuery]);

  const certifications =
    certificationData?.content?.data?.map((cert) => ({
      label: cert.title,
      value: cert.id,
    })) || [];

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

  // Modify handleSubmit to handle multiple users
  const handleSubmit = async () => {
    dispatch(startLoading());
    try {
      await certificationTransactionSchema.validate(
        { ...formData, selectedIds },
        {
          abortEarly: false,
        }
      );

      // Submit each selected user
      await CreateCertificationTransactionApiFunction({
        formData: selectedUsers,
      });

      console.log("Selected users", selectedUsers);

      setModalOpen(true);
    } catch (error: unknown) {
      console.log("error -->", error);

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

        // Extract backend error message with improved error handling
        let errorMessage = "Network Error";

        if (error && typeof error === "object") {
          // Handle axios error response structure
          if ("response" in error && error.response) {
            const response = error.response as {
              data?: {
                message?: string;
                error?: string;
                exception?: string;
                code?: number;
              };
            };

            // Try to extract message from various possible locations
            errorMessage =
              response.data?.message ||
              response.data?.error ||
              response.data?.exception ||
              "Network Error";
          }
          // Handle direct error message
          else if ("message" in error) {
            errorMessage = (error as { message: string }).message;
          }
        }

        setErrors({
          apiError: errorMessage,
        });
      }
    } finally {
      dispatch(stopLoading());
    }
  };

  const usersData = usersList.filter((user) =>
    selectedIds.includes(String(user.id))
  );

  const { data: departments } = useSelector(
    (state: RootState) => state.department
  );

  const handleDepartmentChange = (selected: OptionType[]) => {
    setSelectedDepartments(selected.map((option) => option.value));
  };

  // Company dropdown options
  // const companyOptions = [
  //   { label: "Select Company", value: "" },
  //   ...(companies || []).map((company: Company) => ({
  //     label: company.name,
  //     value: String(company.id),
  //   })),
  // ];

  // Check if company is selected (for super admin)
  const isCompanySelected = isSuperAdmin
    ? selectedCompanyId && selectedCompanyId !== ""
    : true;

  return (
    <>
      {error ? (
        <div className="flex justify-between items-center h-full">{error}</div>
      ) : (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
          <Breadcrumb
            path="Certification"
            subPath="Manage Certification"
            subSubPath="Assign Certification"
          />
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 -mt-2 overflow-x-hidden">
            <div className="flex items-center gap-4 mb-4">
              <BackButton />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
                Assign Certification
              </h1>
            </div>
            {/* 
            <span className="text-gray-500 text-sm">
              Assign certificate template that can be assigned to users upon
              completion of courses or modules.
            </span> */}
            <main className="bg-white p-8 rounded-lg shadow-sm">
              {/* <h2 className="text-lg font-medium mt-6 mb-2">Details</h2> */}
              <form onSubmit={(event) => event.preventDefault()}>
                <div className="w-full grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    {isSuperAdmin && (
                      <SelectField
                        label="Select Company"
                        name="companyId"
                        required
                        value={formData.companyId}
                        onChange={handleChange}
                        error={errors.companyId}
                        options={companyOptions.map((c) => ({
                          label: c.name,
                          value: String(c.id),
                        }))}
                        isSearchable
                        isInfiniteScroll
                        onSearch={handleCompanySearch}
                        onLoadMore={handleCompanyLoadMore}
                        loading={companyLoading}
                        customDropdown={true}
                        className="w-full"
                      />
                    )}

                    <SelectField
                      label="Select Certification"
                      name="certificationId"
                      required
                      value={formData.certificationId}
                      onChange={handleChange}
                      error={errors.certificationId}
                      options={isCompanySelected ? certifications : []}
                      placeholder={
                        isCertificationLoading
                          ? "Loading certifications..."
                          : "Select Certification"
                      }
                      disabled={!isCompanySelected || isCertificationLoading}
                      loading={isCertificationLoading}
                      customDropdown={true}
                      isSearchable={true}
                      isInfiniteScroll={true}
                      onSearch={handleCertificationSearch}
                      onLoadMore={handleCertificationLoadMore}
                      className="w-full"
                    />

                    <SelectField
                      label="Number of Attempts"
                      name="attempts"
                      required
                      value={formData.attempts.toString()}
                      onChange={handleChange}
                      error={errors.attempts}
                      options={[
                        { label: "1", value: "1" },
                        { label: "2", value: "2" },
                        { label: "3", value: "3" },
                        { label: "4", value: "4" },
                        { label: "5", value: "5" },
                      ]}
                      className="w-full"
                      customDropdown={true}
                    />
                  </div>

                  {isSuperAdmin && !isCompanySelected && (
                    <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        Please select a company to view certifications,
                        employees, and departments.
                      </p>
                    </div>
                  )}

                  <div className="col-span-1 md:col-span-2">
                    <h2 className="font-bold">Assign To</h2>
                    <Tabs
                      tabs={tabItems}
                      selectedTab={activeTab}
                      onChange={setActiveTab}
                    />

                    {activeTab === "Users" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-3 items-end">
                        <SearchField
                          placeholder="Search..."
                          className="w-full"
                          onChange={(e) => {
                            if (isCompanySelected) {
                              setSearchQuery(e.target.value);
                            }
                          }}
                          value={searchQuery}
                        />

                        <MultiSelectField
                          label="Department"
                          name="documentIds"
                          value={
                            departments?.data
                              ?.map((doc) => ({
                                label: doc.name,
                                value: doc.id.toString(),
                              }))
                              .filter((doc) =>
                                selectedDepartments.includes(doc.value)
                              ) || []
                          }
                          onChange={handleDepartmentChange}
                          options={
                            departments?.data?.map((doc) => ({
                              label: doc.name,
                              value: doc.id.toString(),
                            })) || []
                          }
                          error={errors.documentIds}
                          className="w-full"
                          placeholder="--Departments--"
                        />
                      </div>
                    )}

                    {activeTab === "Users" && (
                      <div
                        className={` mt-5 p-4 ${errors.selectedIds ? "border border-primary" : ""
                          }`}
                      >
                        {!isCompanySelected ? (
                          <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-gray-600 text-sm">
                              Please select a company to view employees.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-5 -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8 overflow-x-auto md:overflow-x-visible">
                            <div className="table min-w-0 md:min-w-full">
                              <DynamicTable
                                columns={columns}
                                data={usersList}
                                headerType="Award"
                                pagination={{
                                  current: page,
                                  total: Number(pagination?.total || 0),
                                  pageSize: pageSize,
                                }}
                                onPageChange={(page, pageSize) => {
                                  setPage(page);
                                  setPageSize(pageSize);
                                }}
                                rowSelection={false}
                                loading={false}
                                rowKey="id"
                                label={`All ${activeTab}`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "Selected Users" && (
                      <div className="mt-5 -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8 overflow-x-auto md:overflow-x-visible">
                        <div className="table min-w-0 md:min-w-full">
                          <DynamicTable
                            columns={columns}
                            data={usersData}
                            pagination={{
                              current: 1,
                              total: selectedIds.length,
                              pageSize: 10,
                            }}
                            headerType="Award"
                            onPageChange={() => { }}
                            rowSelection={false}
                            loading={false}
                            rowKey="id"
                            label="Selected Users"
                          />
                        </div>
                      </div>
                    )}

                    <div className="my-5">
                      {errors.selectedIds && (
                        <p className="text-xs text-primary">
                          {errors.selectedIds}
                        </p>
                      )}
                    </div>
                  </div>

                  <SuccessModal
                    isOpen={isModalOpen}
                    title="Certification Assign successfully"
                    subtitle="Your Certification Assign has been published."
                    onConfirm={() => {
                      navigate(-1);
                    }}
                  // onClose={() => setModalOpen(false)} // <-- handles outside click
                  />

                  <ErrorModal
                    isOpen={isErrorModelOpen}
                    title={errors.apiError}
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
                  <ButtonPrimary
                    text="Submit"
                    type="button"
                    onClick={handleSubmit}
                  />
                </div>
              </form>
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignCertifications;
