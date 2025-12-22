import { useNavigate, useSearchParams } from "react-router-dom";
import ButtonPrimary from "../../components/ButtonPrimary";
import React, { useEffect, useState, useCallback } from "react";
import SearchField from "../../components/SearchField";
import SelectField from "../../components/SelectField";
import DynamicTable from "../../components/DynamicTable";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { fetchTrainingData } from "../../lib/network/trainingApi";
import { useSelector } from "react-redux";
import ErrorMessage from "../../components/ErrorMessage";
import useDebounce from "../../lib/hooks/useDebounce";
import { RootState } from "../../store";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import LocalStorageStorageUserData from "../../lib/hooks/useLocalStorageUserData";

const Trainings: React.FC = () => {
  const { isSuperAdmin, tenentId } = LocalStorageStorageUserData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") ?? "1");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantIdFilter, setTenantIdFilter] = useState(
    isSuperAdmin ? "all" : tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyHasMore, setCompanyHasMore] = useState(true);

  // Training data state
  const [trainings, setTrainings] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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

  const columns = [
    {
      key: "trainingName",
      label: "Training Name",
      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record?.trainingName}
          </span>
        );
      },
    },
    {
      key: "trainingCode",
      label: "Training Code",
      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[150px] truncate overflow-hidden whitespace-nowrap block">
            {record?.trainingCode}
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
      key: "modules",
      label: "Modules",
      render: (_value: string, record: any) => {
        const moduleCount = record?.Modules?.length || 0;
        return (
          <span className="text-sm text-gray-600">
            {moduleCount} module{moduleCount !== 1 ? "s" : ""}
          </span>
        );
      },
    },
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
      key: "actions",
      label: "Actions",
      render: (_: any, record: any) => {
        return (
          <div className="flex gap-3 action-icon">
            <Tooltip title="View">
              <EyeOutlined
                onClick={() => navigate(`training-details?id=${record.id}`)}
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip>
            <Tooltip title="Edit">
              <EditOutlined
                onClick={() =>
                  navigate(`create-update-training?id=${record.id}`)
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
    setCurrentPage(1);
  }, [debouncedSearchQuery, status, tenantIdFilter]);

  // Reset to page 1 when user starts typing in search
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Fetch training data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const tenantIdToSend = isSuperAdmin
          ? tenantIdFilter !== "all"
            ? tenantIdFilter
            : undefined
          : tenentId?.toString();

        const response = await fetchTrainingData({
          limit: pageSize,
          page: currentPage,
          search: debouncedSearchQuery || undefined,
          status: status === "all" ? undefined : status,
          tenantId: tenantIdToSend,
        });

        if (response && response.content) {
          // Client-side safety filter by tenant for non–Super Admin
          const raw = Array.isArray(response.content.data)
            ? response.content.data
            : [];

          const filtered = isSuperAdmin
            ? raw
            : raw.filter((t: any) => String(t?.tenantId) === String(tenentId));

          setTrainings(filtered);

          const apiPagination = response.content.pagination;
          const totalForUi = isSuperAdmin
            ? apiPagination?.total || filtered.length
            : filtered.length;

          setPagination({
            total: totalForUi,
            page: apiPagination?.page || 1,
            pageSize: apiPagination?.pageSize || 10,
            totalPages: Math.ceil(totalForUi / (apiPagination?.pageSize || 10)),
          });
        } else {
          setTrainings([]);
          setPagination({
            total: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching training data:", error);
        setError("Failed to fetch trainings. Please try again.");
        setTrainings([]);
        setPagination({
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchQuery, status, currentPage, pageSize, tenantIdFilter]);

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

  // Show error message if there's an error
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Trainings</h1>
        <ButtonPrimary
          text="Create Training"
          onClick={() => navigate("create-update-training")}
        />
      </div>
      {/* Filters */}
      <div
        className={`grid grid-cols-1 ${
          isSuperAdmin ? "md:grid-cols-6" : "md:grid-cols-4"
        } gap-4 mt-5`}
      >
        <SearchField
          className={isSuperAdmin ? "md:col-span-3" : "md:col-span-3"}
          value={searchQuery}
          name="searchQuery"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your trainings..."
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
        />
      </div>

      {/* Table container - DynamicTable handles its own horizontal scroll on mobile */}
      <div className="mt-5 -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <DynamicTable
          label="Trainings"
          columns={columns}
          data={trainings}
          headerType="training"
          loading={loading}
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

export default Trainings;
