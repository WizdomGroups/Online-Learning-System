import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import SearchField from "../../components/SearchField";
import SelectField from "../../components/SelectField";
import DynamicTable from "../../components/DynamicTable";
import { EyeOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import useDebounce from "../../lib/hooks/useDebounce";
import ErrorMessage from "../../components/ErrorMessage";
import {
  fetchCertificationTransactionApiFunction,
  downloadLearnerCertificationPdfApiFUnction,
} from "../../lib/network/certificationTransactionApis";
import { capitalize, formatReadableDate } from "../../lib/utils";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";
import { fetchCompaniesList } from "../../lib/network/companyApi";
import { Company } from "../../lib/interface/company";
import { generateCertificatePdf } from "../../lib/utils/generateCertificatePdf";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { message } from "antd";
import { Download } from "lucide-react";

// Minimal type for certification transaction record
interface CertificationTransactionRecord {
  id: number;
  Certification?: { title?: string };
  assignedDate?: string;
  certificationResult?: string;
  CompanyModel?: { name?: string };
  [key: string]: unknown;
}

const CertificationsTransaction: React.FC = () => {
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

  const { status = "assigned" } = useParams();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [tenantIdFilter, setTenantIdFilter] = useState(
    isSuperAdmin ? "all" : tenentId?.toString() || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);

  const handleDownloadCertificationPdf = async (certTransactionId: string) => {
    console.log("=== STARTING PDF DOWNLOAD PROCESS ===");
    console.log("Certificate transaction ID:", certTransactionId);
    console.log("Tenant ID:", tenentId);

    setDownloadingCert(certTransactionId);
    dispatch(startLoading());
    try {
      console.log("Calling API with:", {
        certTransactionId: certTransactionId,
        tenantId: tenentId,
      });

      const response = await downloadLearnerCertificationPdfApiFUnction({
        certTransactionId: certTransactionId,
        tenantId: tenentId,
      });

      console.log("API response received:", response);

      // Check if response has the expected structure
      if (!response.data || !response.data.content) {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response format received from server.");
      }

      const certificationData = response.data.content;
      console.log("Certification data:", certificationData);

      // Validate required data
      if (
        !certificationData.transaction ||
        !certificationData.certification ||
        !certificationData.company
      ) {
        console.error("Missing required data:", {
          transaction: !!certificationData.transaction,
          certification: !!certificationData.certification,
          company: !!certificationData.company,
        });
        throw new Error("Incomplete certification data received from server.");
      }

      // For assessment-based certifications, validate assessmentResult exists
      // For training-only certifications, assessmentResult can be null
      // Note: In the table view, we don't have the full certification object
      // so we'll be more lenient and only check if assessmentResult exists when provided
      const hasAssessmentResult = !!certificationData.assessmentResult;
      console.log("Has assessment result:", hasAssessmentResult);
      console.log("Assessment result:", certificationData.assessmentResult);

      // Only validate assessmentResult if it's provided in the response
      // This allows training-only certifications to work
      if (!hasAssessmentResult) {
        console.log(
          "No assessment result provided - assuming training-only certification"
        );
      }

      console.log(
        "All validations passed. About to call generateCertificatePdf..."
      );
      // Generate PDF using the certification data
      generateCertificatePdf(certificationData);
      console.log("generateCertificatePdf completed successfully!");

      // Show success message
      message.success("Certificate PDF generated successfully!");
    } catch (error: unknown) {
      console.error("=== ERROR IN PDF DOWNLOAD ===");
      console.error("Error details:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );

      const backendMessage =
        (error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string } })?.data?.message
          : undefined) ||
        (error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined) ||
        (typeof error === "string" ? error : "") ||
        "Failed to generate certificate PDF. Please try again.";
      console.log("Final error message:", backendMessage);
      message.error(backendMessage);
    } finally {
      console.log("=== PDF DOWNLOAD PROCESS COMPLETED ===");
      setDownloadingCert(null);
      dispatch(stopLoading());
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      dataIndex: "title",
      render: (_value: string, record: CertificationTransactionRecord) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record?.Certification?.title}
          </span>
        );
      },
    },
    // Conditionally show company name for super admin
    ...(isSuperAdmin
      ? [
        {
          key: "CompanyModel",
          label: "Company Name",
          dataIndex: "CompanyModel",
          render: (
            _value: string,
            record: CertificationTransactionRecord
          ) => {
            return (
              <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
                {record?.CompanyModel?.name || "-"}
              </span>
            );
          },
        },
      ]
      : []),
    {
      key: "employeeDetails",
      label: "Employee Details",
      render: (_value: string, record: CertificationTransactionRecord) => (
        <div>
          <div>
            <span className="font-medium-bold">Name:</span>{" "}
            {String(record.employeeName || "-")}
          </div>
          <div>
            <span className="font-medium-bold">Department:</span>{" "}
            {String(record.department || "-")}
          </div>
          <div>
            <span className="font-medium-bold">Designation:</span>{" "}
            {String(record.designation ?? "-")}
          </div>
        </div>
      ),
    },
    {
      key: "assignedDate",
      label: "Assigned Date",
      dataIndex: "assignedDate",
      render: (_value: string, record: CertificationTransactionRecord) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {formatReadableDate(record?.assignedDate, "date-only")}
          </span>
        );
      },
    },
    {
      key: "certificationResult",
      label: "Result",
      render: (value: string, record: CertificationTransactionRecord) => {
        let color;
        switch (record.certificationResult) {
          case "Pass":
            color = "green";
            break;
          case "Fail":
            color = "gold";
            break;
          case "Pending":
            color = "purple";
            break;
          default:
            color = "purple";
        }

        return (
          <Tag color={color} className="px-3 py-1 rounded-full capitalize">
            {record.certificationResult === "Pass"
              ? "Passed"
              : record.certificationResult === "Fail"
                ? "Failed"
                : "Pending"}
          </Tag>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, record: CertificationTransactionRecord) => {
        return (
          <div className="flex gap-3 action-icon">
            <Tooltip title="View Certification Details">
              <EyeOutlined
                onClick={() => {
                  if (isAdmin) {
                    navigate(
                      `/admin/certifications/view-certifications-transaction?certificationTransactionId=${record.id}`
                    );
                  } else {
                    navigate(
                      `/trainer/certifications/view-certifications-transaction?certificationTransactionId=${record.id}`
                    );
                  }
                }}
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip>
            {record.certificationResult === "Pass" &&
              record.status === "Completed" && (
                <Tooltip title="Download Certificate PDF">
                  <div
                    onClick={() =>
                      handleDownloadCertificationPdf(record.id.toString())
                    }
                    className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${downloadingCert === record.id.toString()
                        ? "text-green-500 bg-green-50"
                        : "text-gray-600 hover:text-green-500 hover:bg-green-50"
                      }`}
                  >
                    {downloadingCert === record.id.toString() ? (
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </div>
                </Tooltip>
              )}
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
  }, [debouncedSearchQuery, tenantIdFilter, resultFilter]);

  useEffect(() => {
    dispatch(
      fetchCertificationTransactionApiFunction({
        pageSize,
        page: currentPage,
        searchQuery: debouncedSearchQuery,
        status: capitalize(status),
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

  const { data: certificationData, error } = useSelector(
    (state: RootState) => state.certificationTransaction
  );

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const certifications = certificationData?.data || [];
  const pagination = certificationData?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
  };
  const total = pagination?.total || 0;

  // Company dropdown options
  // Instead, use companyOptions state and map for SelectField

  // Apply client-side filter for certification result to mirror Certifications tab UX
  const filteredCertifications =
    resultFilter === "all"
      ? certifications
      : certifications.filter((item: any) =>
        String(item?.certificationResult || "").toLowerCase() === resultFilter
      );

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
        <SelectField
          label="Result"
          options={[
            { label: "All", value: "all" },
            { label: "Passed", value: "pass" },
            { label: "Failed", value: "fail" },
            { label: "Pending", value: "pending" },
          ]}
          className="col-span-1"
          value={resultFilter}
          name="resultFilter"
          onChange={(e) => setResultFilter(String(e.target.value))}
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

      <div className="table mt-5">
        <DynamicTable
          label={`${capitalize(status)} Certification`}
          columns={columns}
          data={filteredCertifications}
          headerType="Award"
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

export default CertificationsTransaction;
