import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchField from "../../../components/SearchField";
import DynamicTable from "../../../components/DynamicTable";
import { EyeOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useAppDispatch } from "../../../lib/hooks/useAppDispatch";
import useDebounce from "../../../lib/hooks/useDebounce";
import ErrorMessage from "../../../components/ErrorMessage";
import {
  fetchCertificationTransactionApiFunction,
  downloadLearnerCertificationPdfApiFUnction,
} from "../../../lib/network/certificationTransactionApis";
import { capitalize, formatReadableDate } from "../../../lib/utils";
import Tabs from "../../../components/Tabs";
import useLocalStorageUserData from "../../../lib/hooks/useLocalStorageUserData";
import { generateCertificatePdf } from "../../../lib/utils/generateCertificatePdf";
import {
  startLoading,
  stopLoading,
} from "../../../store/features/globalConstant/loadingSlice";
import { message } from "antd";
import { Download } from "lucide-react";

const EmployeeCertification: React.FC = () => {
  const { user, tenentId } = useLocalStorageUserData();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { status = "assigned" } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const tabItems = [
    { label: "Assigned", value: "assigned" },
    { label: "Re-Assigned", value: "re-assigned" },
    { label: "Under Review", value: "review" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "cancelled" },
  ];

  const handleDownloadCertificationPdf = async (certTransactionId: string) => {
    console.log(
      "=== STARTING PDF DOWNLOAD PROCESS (EmployeeCertification) ==="
    );
    console.log("Certificate transaction ID:", certTransactionId);
    console.log("Tenant ID:", tenentId);

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
      // Note: We don't have access to the certification object here to check isAssessmentRequired
      // So we'll check if assessmentResult exists - if it does, it's assessment-based
      const hasAssessmentResult = !!certificationData.assessmentResult;

      console.log("Has assessment result:", hasAssessmentResult);
      console.log("Assessment result:", certificationData.assessmentResult);

      if (hasAssessmentResult) {
        // This is an assessment-based certification, validate assessmentResult has required fields
        if (
          !certificationData.assessmentResult.id ||
          certificationData.assessmentResult.percentage === undefined
        ) {
          console.error("Assessment result data is incomplete");
          throw new Error(
            "Assessment result data is incomplete for assessment-based certification."
          );
        }
      }
      // For training-only certifications (assessmentResult is null), no additional validation needed

      console.log(
        "All validations passed. About to call generateCertificatePdf..."
      );
      // Generate PDF using the certification data
      generateCertificatePdf(certificationData);
      console.log("generateCertificatePdf completed successfully!");

      message.success("Certificate downloaded successfully!");
    } catch (error: unknown) {
      console.error("=== ERROR IN PDF DOWNLOAD (EmployeeCertification) ===");
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
      console.log(
        "=== PDF DOWNLOAD PROCESS COMPLETED (EmployeeCertification) ==="
      );
      dispatch(stopLoading());
    }
  };

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

      render: (_value: string, record: any) => {
        return (
          <span className="max-w-[200px] truncate overflow-hidden whitespace-nowrap block">
            {record?.Certification?.title}
          </span>
        );
      },
    },

    // {
    //   key: "employeeName",
    //   label: "Employee Name",
    //   dataIndex: "employeeName",
    // },
    // {
    //   key: "department",
    //   label: "Department",
    //   dataIndex: "department",
    // },
    // {
    //   key: "designation",
    //   label: "Designation",
    //   dataIndex: "designation",
    // },
    {
      key: "assignedDate",
      label: "Assigned Date",
      dataIndex: "assignedDate",
      render: (value: string, record: any) => {
        return (
          <span>{formatReadableDate(record?.assignedDate, "date-only")}</span>
        );
      },
    },
    {
      key: "certificationResult",
      label: "Result",
      render: (value: string, record: any) => {
        let color;
        let displayText;

        switch (record.certificationResult) {
          case "Pass":
            color = "green";
            displayText = "Passed";
            break;
          case "Fail":
            color = "gold";
            displayText = "Failed";
            break;
          case "Pending":
            color = "purple";
            displayText = "Pending";
            break;
          default:
            color = "purple";
            displayText = record.certificationResult;
        }

        return (
          <Tag color={color} className="px-3 py-1 rounded-full capitalize">
            {displayText}
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
            <Tooltip title="View Certification Details">
              <EyeOutlined
                onClick={() =>
                  navigate(
                    `/employee/certifications/view-certifications/?certificationTransactionId=${record.id}`
                  )
                }
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip>
            {record.certificationResult === "Pass" &&
              record.status === "Completed" && (
                <Tooltip title="Download Certificate PDF">
                  <Download
                    onClick={() => handleDownloadCertificationPdf(record.id)}
                    className="cursor-pointer text-gray-600 hover:text-green-500 w-4 h-4"
                  />
                </Tooltip>
              )}
            {/* <Tooltip title="Edit">
              <EditOutlined
                onClick={() =>
                  navigate(
                    `create-update-certifications?certificateId=${record.id}`
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

  useEffect(() => {
    dispatch(
      fetchCertificationTransactionApiFunction({
        pageSize,
        page: currentPage,
        searchQuery: debouncedSearchQuery,
        status: capitalize(status),
        employeeId: user?.employeeId,
      })
    );
  }, [dispatch, debouncedSearchQuery, status, currentPage, pageSize]);

  const { data: certificationData, error } = useSelector(
    (state: RootState) => state.certificationTransaction
  );

  // if (loading) {
  //   return <div></div>;
  // }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const certifications = certificationData?.data || [];
  const pagination = certificationData?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
  };
  const total = pagination.total || 0;

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Certification</h1>
      </div>

      <Tabs
        tabs={tabItems}
        selectedTab={status}
        onChange={(tab) => navigate(`/employee/certifications/${tab}`)}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 col-span-2 md:col-end-4 mt-5">
        <SearchField
          className="col-span-4"
          value={searchQuery}
          name="searchQuery"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search your certification..."
        />
      </div>

      <div className="table mt-5">
        <DynamicTable
          label={`${capitalize(status)} Certification`}
          columns={columns}
          data={certifications}
          headerType="grades"
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
    </div>
  );
};

export default EmployeeCertification;
