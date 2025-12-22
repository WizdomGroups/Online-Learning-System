import React, { useEffect, useState, useCallback } from "react";
import useDebounce from "../../lib/hooks/useDebounce";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import ErrorMessage from "../../components/ErrorMessage";
import SearchField from "../../components/SearchField";
import DynamicTable from "../../components/DynamicTable";
import { fetchAssessmentAnswerData } from "../../lib/network/assessmentApis";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Tag, Tooltip } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { formatReadableDate } from "../../lib/utils";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import SelectField from "../../components/SelectField";
import { Company } from "../../lib/interface/company";

const AssessmentAnswers = () => {
  const { isAdmin, isTrainer, isSuperAdmin, tenentId } =
    useLocalStorageUserData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") ?? "1");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [companyOptions, setCompanyOptions] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantIdFilter, setTenantIdFilter] = useState(
    isSuperAdmin ? "all" : tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const columns = [
    {
      key: "employeeName",
      label: "Employee Name",
      dataIndex: "employeeName",
      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record?.employeeName || "-"}
          </span>
        );
      },
    },
    {
      key: "answerCount",
      label: "Questions Answered",
      dataIndex: "answerCount",
      render: (_value: number, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record?.answerCount || 0}
          </span>
        );
      },
    },
    {
      key: "transactionCreatedAt",
      label: "Assigned Date",
      dataIndex: "transactionCreatedAt",
      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {formatReadableDate(record?.transactionCreatedAt, "date-only")}
          </span>
        );
      },
    },
    {
      key: "latestCreatedAt",
      label: "Last Updated",
      dataIndex: "latestCreatedAt",
      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {formatReadableDate(record?.latestCreatedAt, "date-only")}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Assessment Status",
      render: (_: string, record: any) => {
        const status = record?.status ?? "N/A";
        let color = "green";

        switch (status.toLowerCase()) {
          case "completed":
            color = "green";
            break;
          case "assigned":
            color = "gold";
            break;
          case "review":
            color = "purple";
            break;
          case "in_progress":
            color = "blue";
            break;
          default:
            color = "default";
        }

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, record: any) => {
        return (
          <div className="flex gap-3 action-icon">
            <Tooltip title="View">
              <EyeOutlined
                onClick={() => {
                  if (isAdmin) {
                    navigate(
                      `/admin/assessments/view-assessment-answers?answerGroupId=${record.answerGroupId}`
                    );
                  } else {
                    navigate(
                      `/trainer/assessments/view-assessment-answers?answerGroupId=${record.answerGroupId}`
                    );
                  }
                }}
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip>
            {/* <Tooltip title="Edit">
              <EditOutlined
                onClick={() =>
                  navigate(
                    `create-update-assessment-excel?moduleId=${record.answerGroupId}`
                  )
                }
                className="cursor-pointer text-gray-600 hover:text-green-500"
              />
            </Tooltip> */}
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
        Array.isArray((response.payload as any).content.result.data)
      ) {
        companies = (response.payload as any).content.result.data;
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
  }, [debouncedSearchQuery, tenantIdFilter]);

  useEffect(() => {
    dispatch(
      fetchAssessmentAnswerData({
        pageSize,
        page: currentPage,
        searchQuery: debouncedSearchQuery,
        ...(tenantIdFilter && tenantIdFilter !== "all"
          ? { tenantId: tenantIdFilter }
          : {}),
      })
    );
  }, [dispatch, debouncedSearchQuery, currentPage, pageSize, tenantIdFilter]);

  useEffect(() => {
    // Only update the 'page' query param
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", currentPage.toString());
      return newParams;
    });
  }, [currentPage, setSearchParams]);

  const {
    data: assessmentAnswers,
    error,
    loading,
  } = useSelector((state: RootState) => state.assessmentAnswer);


  const assessments = Array.isArray(assessmentAnswers?.content?.data)
    ? assessmentAnswers.content.data
    : [];

  const pagination = assessmentAnswers?.content?.pagination || {
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
          label="Answers"
          columns={columns}
          data={assessments}
          headerType="assessmentsAns"
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

export default AssessmentAnswers;
