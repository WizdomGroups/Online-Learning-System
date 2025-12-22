import React, { useEffect, useState, useCallback } from "react";
import useDebounce from "../../lib/hooks/useDebounce";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import ErrorMessage from "../../components/ErrorMessage";
import SearchField from "../../components/SearchField";
import DynamicTable from "../../components/DynamicTable";
import { fetchAssessmentData } from "../../lib/network/assessmentApis";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Tag, Tooltip } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import SelectField from "../../components/SelectField";
import { Company } from "../../lib/interface/company";

const AssessmentQuestions = () => {
  const { isAdmin, isSuperAdmin, tenentId } = useLocalStorageUserData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") ?? "1");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [companyOptions, setCompanyOptions] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  const status = "active"; // Remove unused state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantIdFilter, setTenantIdFilter] = useState(
    isSuperAdmin ? "all" : tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const columns = [
    {
      key: "certificationName",
      label: "Certification Name",
      dataIndex: "certificationName",
      render: (_value: string, record: Record<string, unknown>) => {
        return (
          <span className="max-w-[220px] truncate overflow-hidden whitespace-nowrap block">
            {(record?.certificationName as string) || "-"}
          </span>
        );
      },
    },
    // {
    //   key: "certificationDescription",
    //   label: "Certification Description",
    //   render: (_value: string, record: Record<string, unknown>) => {
    //     // Description is not present in the current response; show '-'
    //     const description = (record as any)?.certificationDescription as
    //       | string
    //       | undefined;
    //     return (
    //       <span className="max-w-[260px] truncate overflow-hidden whitespace-nowrap block">
    //         {description || "-"}
    //       </span>
    //     );
    //   },
    // },
   
    // Conditionally show company name for super admin
    ...(isSuperAdmin
      ? [
          {
            key: "companyName",
            label: "Company",
            render: (_value: string, record: Record<string, unknown>) => (
              <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
                {(record?.tenantDetails as { name?: string })?.name || "-"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "questionCount",
      label: "Questions",
      dataIndex: "questionCount",
      render: (value: number) => {
        const questionCount = value ?? 0;
        return <span className="text-gray-800">{questionCount}</span>;
      },
    },
    {
      key: "passPercentage",
      label: "Pass %",
      dataIndex: "passPercentage",
      render: (value: string) => <span>{value ? `${value}%` : "-"}</span>,
    },
  {
  key: "certificationStatus",
  label: "Certification Status",
  render: (_: string, record: Record<string, unknown>) => {
    const status = (record?.certificationStatus as string) || "-";

    let colorClass = "text-gray-800"; // default color
    switch (status.toLowerCase()) {
      case "active":
        colorClass = "text-green-600";
        break;
      case "inactive":
        colorClass = "text-red-600";
        break;
      case "pending":
        colorClass = "text-purple-600";
        break;
      case "cancelled":
        colorClass = "text-yellow-600";
        break;
    }

    return <span className={`capitalize ${colorClass}`}>{status}</span>;
  },
},

    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, record: Record<string, unknown>) => {
        return (
          <div className="flex gap-3 action-icon">
            <Tooltip
              title={
                record?.questionGroupId
                  ? "View Questions"
                  : "View Questions (by Certification ID)"
              }
            >
              <EyeOutlined
                onClick={() => {
                  const questionGroupId = String(
                    (record as any)?.questionGroupId || ""
                  );
                  const certificationId = String(
                    (record as any)?.certificationId || ""
                  );

                  console.log("View action clicked:", {
                    questionGroupId,
                    certificationId,
                    record,
                    isAdmin,
                  });

                  const base = isAdmin ? "/admin" : "/trainer";

                  // If questionGroupId exists, use it; otherwise use certificationId
                  if (questionGroupId && questionGroupId !== "null") {
                    const url = `${base}/assessments/view-assessment-questions?questionGroupId=${questionGroupId}`;
                    console.log("Navigating with questionGroupId:", url);
                    navigate(url);
                  } else if (certificationId) {
                    // Try to view by certificationId as fallback
                    const url = `${base}/assessments/view-assessment-questions?certificationId=${certificationId}`;
                    console.log("Navigating with certificationId:", url);
                    navigate(url);
                  } else {
                    console.log("No valid identifier for viewing questions");
                    alert("No valid identifier found for viewing questions");
                  }
                }}
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip>
            <Tooltip title="Edit">
              <EditOutlined
                onClick={() => {
                  // Prepopulate certificationId, certificationName, tenantId, tenantName in query params
                  const certificationId = (record as any)?.certificationId as
                    | string
                    | number;
                  const certificationName = (record as any)
                    ?.certificationName as string;
                  const tenantId = (
                    record.tenantDetails as { id?: string | number }
                  )?.id;
                  const tenantName = (record.tenantDetails as { name?: string })
                    ?.name;
                  const params = new URLSearchParams({
                    certificationId: certificationId
                      ? String(certificationId)
                      : "",
                    certificationTitle: certificationName || "",
                    tenantId: tenantId ? String(tenantId) : "",
                    tenantName: tenantName || "",
                  }).toString();
                  const base = isAdmin ? "/admin" : "/trainer";
                  navigate(
                    `${base}/assessments/create-update-assessment-excel?${params}`
                  );
                }}
                className="cursor-pointer text-gray-600 hover:text-green-500"
              />
            </Tooltip>
            {/* <Tooltip title="Delete">
              <DeleteOutlined
                onClick={() => console.log("Delete key:", record.key)}
                className="cursor-pointer text-gray-600 hover:text-primary"
              />
            </Tooltip> */}
          </div>
        );
      },
    },
  ];

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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, status, tenantIdFilter]);

  useEffect(() => {
    dispatch(
      fetchAssessmentData({
        pageSize,
        page: currentPage,
        searchQuery: debouncedSearchQuery,
        status,
        tenantId:
          tenantIdFilter && tenantIdFilter !== "all" ? tenantIdFilter : "",
      })
    );
  }, [
    dispatch,
    debouncedSearchQuery,
    status,
    currentPage,
    pageSize,
    tenantIdFilter,
  ]);

  useEffect(() => {
    // Only update the 'page' query param
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", currentPage.toString());
      return newParams;
    });
  }, [currentPage, setSearchParams]);

  const {
    data: assessmentData,
    error,
    loading,
  } = useSelector((state: RootState) => state.assessment);

  const assessments = Array.isArray(assessmentData?.content?.data)
    ? assessmentData.content.data
    : [];

  // Debug logging
  console.log("Assessment data loaded:", {
    assessmentData,
    assessments,
    loading,
    error,
  });

  const pagination = assessmentData?.content?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
  };

  const total = pagination.total || 0;

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 col-span-2 md:col-end-4 mt-5">
        <SearchField
          className="col-span-3"
          value={searchQuery}
          name="searchQuery"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your assessments..."
        />
        {/* <FilterField label="Certificate Name" className="col-span-1" /> */}
        {/* <ValidityField label="Validity" className="col-span-1" /> */}
        {/* <SelectField
          label="Status"
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          className="col-span-1"
          value={status}
          name="status"
          onChange={(e) => setStatus(e.target.value)}
        /> */}
        {isSuperAdmin && (
          <SelectField
            label="Company"
            options={companyOptions.map((c) => ({
              label: c.name,
              value: String(c.id),
            }))}
            className="col-span-1"
            value={tenantIdFilter}
            name="tenantIdFilter"
            onChange={(e) => setTenantIdFilter(e.target.value)}
            isSearchable
            isInfiniteScroll
            onSearch={handleCompanySearch}
            onLoadMore={handleCompanyLoadMore}
            loading={companyLoading}
            customDropdown={true}
          />
        )}
      </div>

      {/* Table container - DynamicTable handles its own horizontal scroll on mobile */}
      <div className="mt-5 -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <DynamicTable
          loading={loading}
          label="Questions"
          columns={columns}
          data={assessments}
          headerType="assessments"
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
          }}
          onPageChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }}
          // pathToNavigate="/module-details"
        />
      </div>
    </div>
  );
};

export default AssessmentQuestions;
