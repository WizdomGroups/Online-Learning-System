import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import SearchField from "../../components/SearchField";
import SelectField from "../../components/SelectField";
import DynamicTable from "../../components/DynamicTable";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import useDebounce from "../../lib/hooks/useDebounce";
import { fetchCertificationDateApiFunction } from "../../lib/network/certificationApi";
import ErrorMessage from "../../components/ErrorMessage";
import Tooltip1 from "../../components/Tooltip";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import { capitalize } from "../../lib/utils";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { Company } from "../../lib/interface/company";
// Minimal type for company column
interface CertificationRecord {
  CompanyModel?: { name?: string };
  isFeedbackRequired?: boolean;
  isAssessmentRequired?: boolean;
  id: number;
  title: string;
  status: string;
  tenantId?: number; // for mapping company name when backend doesn't include CompanyModel
  companyId?: number | null;
  [key: string]: unknown;
}

const AllCertifications: React.FC = () => {
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

  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantIdFilter, setTenantIdFilter] = useState(
    tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const columns = [
    // {
    //   key: "id",
    //   label: "ID",
    //   dataIndex: "id",
    // },
    {
      key: "title",
      label: "Title",
      dataIndex: "title",
      render: (value: string) => (
        <Tooltip1 text={value} maxLength={25}>
          <span className="max-w-[220px] truncate overflow-hidden whitespace-nowrap block">
            {value}
          </span>
        </Tooltip1>
      ),
    },
    // Conditionally show company name for super admin
    ...(isSuperAdmin
      ? [
        {
          key: "CompanyModel",
          label: "Company Name",
          dataIndex: "CompanyModel",
          render: (_value: string, record: CertificationRecord) => {
            // Prefer backend-provided name; fallback to client-mapped company list by tenantId
            const fallbackName = companyOptions.find(
              (c) => String(c.id) === String(record?.tenantId ?? "")
            )?.name;
            const companyName = record?.CompanyModel?.name || fallbackName || "-";
            return (
              <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
                {companyName}
              </span>
            );
          },
        },
      ]
      : []),
    {
      key: "feedback",
      label: "Feedback",
      render: (_value: string, record: CertificationRecord) => {
        const hasFeedback = record.isFeedbackRequired;
        return (
          <Tag
            color={hasFeedback ? "green" : "red"}
            className="px-3 py-1 rounded-full"
          >
            {hasFeedback ? "Yes" : "No"}
          </Tag>
        );
      },
    },
    {
      key: "assessment",
      label: "Assessment",
      render: (_value: string, record: CertificationRecord) => {
        const hasAssessment = record.isAssessmentRequired;
        return (
          <Tag
            color={hasAssessment ? "green" : "red"}
            className="px-3 py-1 rounded-full"
          >
            {hasAssessment ? "Yes" : "No"}
          </Tag>
        );
      },
    },
    {
      key: "assessmentTime",
      label: "Time in Min",
      dataIndex: "assessmentTime",
    },
    {
      key: "passPercentage",
      label: "Pass (%)",
      dataIndex: "passPercentage",
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, record: CertificationRecord) => {
        let color;
        switch (record.status) {
          case "active":
            color = "green";
            break;
          case "inactive":
            color = "gold";
            break;
          case "expired":
            color = "red";
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
      render: (_: unknown, record: CertificationRecord) => {
        return (
          <div className="flex gap-3 action-icon">
            <Tooltip title="View">
              <EyeOutlined
                onClick={() => {
                  if (isAdmin) {
                    navigate(
                      `/admin/certifications/view-certifications?certificateId=${record.id}`
                    );
                  } else {
                    navigate(
                      `/trainer/certifications/view-certifications?certificateId=${record.id}`
                    );
                  }
                }}
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip>
            <Tooltip title="Edit">
              <EditOutlined
                onClick={() => {
                  if (isAdmin) {
                    navigate(
                      `/admin/certifications/create-update-certifications?certificateId=${record.id}`
                    );
                  } else {
                    navigate(
                      `/trainer/certifications/create-update-certifications?certificateId=${record.id}`
                    );
                  }
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
    const payload: any = {
      pageSize,
      page: currentPage,
      searchQuery: debouncedSearchQuery,
    };

    if (status && status !== "all") {
      payload.status = status;
    }

    if (tenantIdFilter && tenantIdFilter !== "all") {
      (payload as any).tenantId = tenantIdFilter;
    } else if (tenentId) {
      (payload as any).tenantId = String(tenentId);
    }

    dispatch(fetchCertificationDateApiFunction(payload));
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

  const { data: certificationData, error } = useSelector(
    (state: RootState) => state.certification
  );

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const certifications = certificationData?.content?.data || [];
  const pagination = certificationData?.content?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
  };
  const total = pagination?.total || 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
        <SearchField
          className="col-span-2"
          value={searchQuery}
          name="searchQuery"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search your certification..."
        />
        {/* <FilterField label="Certificate Name" className="col-span-1" /> */}
        {/* <ValidityField label="Validity" className="col-span-1" /> */}
        <SelectField
          label="Status"
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            // { label: "Expired", value: "expired" },
          ]}
          className="col-span-1"
          value={status}
          name="status"
          onChange={(e) => setStatus(e.target.value)}
          customDropdown={true}
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
      <div className="mt-5">
        <DynamicTable
          label="All Certification"
          columns={columns}
          headerType="Award"
          data={certifications}
          pagination={{
            current: currentPage,
            total,
            pageSize: pageSize,
          }}
          onPageChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }}
        />
      </div>
    </>
  );
};

export default AllCertifications;
