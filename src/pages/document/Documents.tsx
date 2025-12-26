import { useNavigate, useSearchParams } from "react-router-dom";
import ButtonPrimary from "../../components/ButtonPrimary";
import React, { useEffect, useState, useCallback } from "react";
import SearchField from "../../components/SearchField";
import SelectField from "../../components/SelectField";
import DynamicTable from "../../components/DynamicTable";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { fetchDocumentData } from "../../lib/network/documentApis";
import { useSelector } from "react-redux";
import ErrorMessage from "../../components/ErrorMessage";
import useDebounce from "../../lib/hooks/useDebounce";
import { RootState } from "../../store";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import LocalStorageStorageUserData from "../../lib/hooks/useLocalStorageUserData";

const Documents: React.FC = () => {
  const { isSuperAdmin, tenentId } = LocalStorageStorageUserData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") ?? "1");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantIdFilter, settenantIdFilter] = useState(
    isSuperAdmin ? "all" : tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  // Fetch companies with search and pagination
  const fetchCompanies = useCallback(
    async (search = "", page = 1) => {
      setCompanyLoading(true);
      const response = await dispatch(
        fetchCompaniesList({ search, page, limit: 20 })
      );
      let companies: any[] = [];
      if (
        typeof response?.payload === "object" &&
        response?.payload !== null &&
        Array.isArray((response.payload as any)?.content?.result?.data)
      ) {
        companies = (response.payload as any).content.result.data;
      } else if (
        typeof response?.payload === "object" &&
        response?.payload !== null &&
        Array.isArray((response.payload as any)?.data)
      ) {
        companies = (response.payload as any).data;
      } else if (Array.isArray(response?.payload)) {
        companies = response.payload;
      }
      setCompanyHasMore(companies.length === 20);
      setCompanyOptions((prev) =>
        page === 1 ? companies : [...prev, ...companies]
      );
      setCompanyLoading(false);
    },
    [dispatch]
  );

  // Initial fetch
  useEffect(() => {
    if (isSuperAdmin) {
      fetchCompanies("", 1);
    }
  }, [fetchCompanies]);

  // Handle search
  const handleCompanySearch = (query: string) => {
    setCompanySearchQuery(query);
    setCompanyPage(1);
    fetchCompanies(query, 1);
  };

  // Handle load more
  const handleCompanyLoadMore = () => {
    if (companyHasMore && !companyLoading) {
      const nextPage = companyPage + 1;
      setCompanyPage(nextPage);
      fetchCompanies(companySearchQuery, nextPage);
    }
  };

  // const tabItems = [{ label: "All Documents", value: "all" }];

  const columns = [
    {
      key: "name",
      label: "Document Name",
      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record?.name}
          </span>
        );
      },
    },

    {
      key: "description",
      label: "Description",
      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record?.description}
          </span>
        );
      },
    },
    ...(isSuperAdmin
      ? [
        {
          key: "companyName",
          label: "Company",
          render: (_value: string, record: any) => (
            <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
              {record?.CompanyModel?.name || "-"}
            </span>
          ),
        },
      ]
      : []),
    {
      key: "status",
      label: "Status",
      render: (value: string, record: any) => {
        let color = "default";
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
            {record.status}
          </Tag>
        );
      },
    },
    {
      key: "securityType.name",
      label: "Security",
      render: (_value: string, record: any) => {
        let color = "default";
        const securityLevel = record.securityType?.name;

        switch (securityLevel) {
          case "High":
            color = "green";
            break;
          case "Medium":
            color = "gold";
            break;
          case "Low":
            color = "red";
            break;
        }

        return (
          <Tag color={color} className="px-3 py-1 rounded-full capitalize">
            {securityLevel}
          </Tag>
        );
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
                onClick={() => navigate(`document-details?id=${record.id}`)}
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip>
            <Tooltip title="Edit">
              <EditOutlined
                onClick={() =>
                  navigate(`create-update-document?id=${record.id}`)
                }
                className="cursor-pointer text-gray-600 hover:text-green-500"
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (isSuperAdmin) {
      // Remove any other fetchCompaniesList({ page: 1, limit: 100 }) call
    }
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, status, tenantIdFilter]);

  useEffect(() => {
    dispatch(
      fetchDocumentData({
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
    if (searchQuery && status !== "all") {
      const timer = setTimeout(() => {
        setStatus("all");
      }, 500); // Match debounce

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Only update the 'page' query param
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", currentPage.toString());
      return newParams;
    });
  }, [currentPage, setSearchParams]);

  const {
    data: documentData,
    error,
    loading,
  } = useSelector((state: RootState) => state.document);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const documents = documentData?.documents || [];
  const pagination = documentData?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
  };
  const total = pagination?.total || 0;

  // Always use an array for options
  const safeCompanyOptions = Array.isArray(companyOptions)
    ? companyOptions
    : [];

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Documents</h1>
        <ButtonPrimary
          text="Create Document"
          onClick={() => navigate("create-update-document")}
        />
      </div>
      {/* Filters */}
      <div
        className={`grid grid-cols-1 items-end ${isSuperAdmin ? "md:grid-cols-6" : "md:grid-cols-4"
          } gap-4 mt-5`}
      >
        <SearchField
          className={isSuperAdmin ? "md:col-span-3" : "md:col-span-3"}
          value={searchQuery}
          name="searchQuery"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your documents..."
        />

        {isSuperAdmin && (
          <SelectField
            label="Company"
            options={safeCompanyOptions.map((c) => ({
              label: c.name,
              value: String(c.id),
            }))}
            className="md:col-span-2"
            value={tenantIdFilter}
            name="tenantIdFilter"
            onChange={(e) => settenantIdFilter(e.target.value)}
            isSearchable
            isInfiniteScroll
            onSearch={handleCompanySearch}
            onLoadMore={handleCompanyLoadMore}
            loading={companyLoading}
            customDropdown={true}
            placeholder="Search or select company..."
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
          customDropdown={true}
        />
      </div>

      {/* Table container - DynamicTable handles its own horizontal scroll on mobile */}
      <div className="mt-5 -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <DynamicTable
          label="Documents"
          columns={columns}
          data={documents}
          headerType="document"
          pagination={{
            current: pagination.page,
            total: total,
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

export default Documents;
