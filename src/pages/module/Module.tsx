import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ButtonPrimary from "../../components/ButtonPrimary";
import SearchField from "../../components/SearchField";
import SelectField from "../../components/SelectField";
import DynamicTable from "../../components/DynamicTable";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";
import useDebounce from "../../lib/hooks/useDebounce";
import { fetchModuleData } from "../../lib/network/moduleApi";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { useSelector } from "react-redux";
import ErrorMessage from "../../components/ErrorMessage";
import { RootState } from "../../store";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import LocalStorageStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { Company } from "../../lib/interface/company";
import { CompanyListResponse } from "../../lib/interface/company";

const Module: React.FC = () => {
  const { isSuperAdmin, tenentId } = LocalStorageStorageUserData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") ?? "1");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
          (response.payload as CompanyListResponse).content.result.data
        )
      ) {
        companies = (response.payload as CompanyListResponse).content.result
          .data;
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

  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantIdFilter, setTenantIdFilter] = useState(
    isSuperAdmin ? "all" : tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const columns = [
    {
      key: "name",
      label: "Module Name",
      render: (_value: string, record: Record<string, unknown>) => (
        <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
          {(record as { name?: string }).name}
        </span>
      ),
    },
    {
      key: "m_wizdomCategory.name",
      label: "Category",
      render: (_value: string, record: Record<string, unknown>) => {
        let color = "gray";
        const category = (record?.MasterCategoryModel as { name?: string })
          ?.name;

        switch (category) {
          case "General":
            color = "green";
            break;
          case "Specific":
            color = "purple";
            break;
          case "Mandatory":
            color = "gold";
            break;
        }

        return (
          <Tag color={color} className="px-3 py-1 rounded-full capitalize">
            {category}
          </Tag>
        );
      },
    },
    ...(isSuperAdmin
      ? [
        {
          key: "companyName",
          label: "Company",
          render: (_value: string, record: Record<string, unknown>) => (
            <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
              {(record?.CompanyModel as { name?: string })?.name || "-"}
            </span>
          ),
        },
      ]
      : []),
    {
      key: "allotedTimeMins",
      label: "Time",
      dataIndex: "allotedTimeMins",
    },
    {
      key: "status",
      label: "Status",
      render: (_value: string, record: Record<string, unknown>) => {
        let color = "gray";
        switch (record.status) {
          case "active":
            color = "green";
            break;
          case "inactive":
            color = "gold";
            break;
          case "Pending":
            color = "purple";
            break;
          default:
            color = "gray";
        }

        return (
          <Tag color={color} className="px-3 py-1 rounded-full capitalize">
            {record.status as string}
          </Tag>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-3 action-icon">
          <Tooltip title="View">
            <EyeOutlined
              onClick={() => navigate(`module-details?id=${record.id}`)}
              className="cursor-pointer text-gray-600 hover:text-blue-500"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <EditOutlined
              onClick={() => navigate(`create-update-module?id=${record.id}`)}
              className="cursor-pointer text-gray-600 hover:text-green-500"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, status, tenantIdFilter]);

  useEffect(() => {
    dispatch(
      fetchModuleData({
        limit: pageSize,
        page: currentPage,
        searchQuery: debouncedSearchQuery,
        status,
        ...(tenantIdFilter && tenantIdFilter !== "all"
          ? { tenantId: tenantIdFilter }
          : {}),
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

  const { data: moduleData, error } = useSelector(
    (state: RootState) => state.module
  );

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const modules = moduleData?.content?.data?.data || [];
  const rawPagination = moduleData?.content?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
  };
  const pagination = {
    total: rawPagination.total,
    page: rawPagination.page,
    pageSize:
      "pageSize" in rawPagination &&
        typeof (rawPagination as { pageSize?: number }).pageSize === "number"
        ? (rawPagination as { pageSize: number }).pageSize
        : rawPagination.limit ?? 10,
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Modules</h1>
        <ButtonPrimary
          text="Create Module"
          onClick={() => navigate("create-update-module")}
        />
      </div>
      {/* Filters */}
      <div
        className={`grid grid-cols-1 ${isSuperAdmin ? "md:grid-cols-6" : "md:grid-cols-4"
          } gap-4 mt-5`}
      >
        {" "}
        <SearchField
          className="md:col-span-3"
          value={searchQuery}
          name="searchQuery"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your modules..."
        />
        {isSuperAdmin && (
          <SelectField
            label="Company"
            options={companyOptions.map((c) => ({
              label: c.name,
              value: String(c.id),
            }))}
            className="md:col-span-2"
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
        <SelectField
          label="Status"
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          className="md:col-span-1"
          value={status}
          name="status"
          onChange={(e) => setStatus(e.target.value)}
        />
      </div>

      {/* Table container - DynamicTable handles its own horizontal scroll on mobile */}
      <div className="mt-5 -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <DynamicTable
          label="Modules"
          columns={columns}
          headerType="modules"
          data={modules}
          pagination={{
            current: pagination.page,
            total: pagination.total,
            pageSize: pagination.pageSize,
          }}
          onPageChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }}
        />
      </div>
    </div>
  );
};

export default Module;
