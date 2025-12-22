import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ErrorMessage from "../../components/ErrorMessage";
import ErrorModal from "../../components/ErrorModal";
import { fetchCertificationByIdApiFunction } from "../../lib/network/certificationApi";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import { FileText, Download, Eye, BookOpen, FileDown } from "lucide-react";
import { Tag, Button, message, Modal, Table } from "antd";
import { downloadModuleFile } from "../../lib/network/moduleApi";
import { downloadDocumentAttachment } from "../../lib/network/documentApis";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";

// Types for the enhanced certification data
interface AssessmentQuestion {
  questionId: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctAnswer: number;
  status: string;
  complexity: string;
  questionGroupId: string;
  version: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentFile {
  id: number;
  filePath: string;
  version: number;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: number;
  name: string;
  description: string;
  status: string;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  files: DocumentFile[];
  ModuleDocuments: {
    id: number;
    documentId: number;
    moduleId: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface Module {
  id: number;
  name: string;
  description: string;
  assessment: boolean;
  feedback: boolean;
  allotedTimeMins: number;
  status: string;
  categoryId: number;
  moduleOrder: number | null;
  createdAt: string;
  updatedAt: string;
  Documents: Document[];
  AssessmentQuestions: AssessmentQuestion[];
  MasterCategoryModel: {
    id: number;
    name: string;
    description: string;
  };
}

interface Certification {
  id: number;
  tenantId: number;
  title: string;
  trimmedTitle: string;
  description: string;
  createdBy: string | null;
  status: string;
  totalAssessmentQuestions: number;
  assessmentTime: number;
  passPercentage: string;
  interval_unit: string;
  interval_value: number | null;
  expiry_date: string | null;
  isAssessmentRequired: boolean;
  isFeedbackRequired: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number | null;
  companyId: number | null;
  MasterCertificationType: unknown | null;
  CompanyModel: {
    id: number;
    name: string;
  };
  trainings: Training[];
  AssessmentQuestions: AssessmentQuestion[];
}

interface Training {
  id: number;
  trainingName: string;
  trainingCode: string;
  status: string;
  TrainingModules: TrainingModule[];
  CertificationTraining: {
    id: number;
    certificationId: number;
    trainingId: number;
    tenantId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface TrainingModule {
  id: number;
  moduleOrder: number;
  Module: {
    id: number;
    name: string;
    description: string;
    Documents: Document[];
  };
}

const CertificationDetails = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const certificateId = searchParams.get("certificateId");
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [documentDownloadError, setDocumentDownloadError] = useState("");

  const {
    data: certificationDate,
    loading,
    error,
  } = useSelector((state: RootState) => state.certificationById);

  useEffect(() => {
    if (certificateId) {
      dispatch(fetchCertificationByIdApiFunction({ certificateId }));
    }
  }, [dispatch, certificateId]);

  // Unified download handler for both module and document files
  const handleDownload = async (
    fileId: number,
    filePath: string,
    version: number,
    isModuleFile: boolean = true,
    moduleId?: number,
    documentId?: number
  ) => {
    try {
      setDownloadingFile(fileId);
      dispatch(startLoading());

      let blob: Blob;
      if (isModuleFile) {
        // Download module file
        blob = await downloadModuleFile(moduleId!, fileId);
      } else {
        // Download document file
        blob = await downloadDocumentAttachment(documentId!, fileId);
      }

      const url = window.URL.createObjectURL(blob);
      const ext = filePath.split(".").pop() || "file";
      const downloadFileName = isModuleFile
        ? `module-${moduleId}-v${version}.${ext}`
        : `document-${documentId}-v${version}.${ext}`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("File downloaded successfully!");
    } catch (error: unknown) {
      console.log("error-->", error);
      let errorMessage = "Failed to download file. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const { status, data } =
          (
            error as {
              response: { status?: number; data?: { message?: string } };
            }
          ).response || {};

        switch (status) {
          case 404:
            errorMessage = data?.message || "File not found.";
            break;
          case 403:
            errorMessage =
              "Access denied. You don't have permission to download this file.";
            break;
          case 400:
            errorMessage =
              data?.message || "Invalid request. Please try again.";
            break;
          case 500:
            errorMessage =
              "Server error. Please try again later or contact support.";
            break;
          default:
            errorMessage =
              data?.message || "Download failed. Please try again.";
        }
      } else if (error && typeof error === "object" && "request" in error) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else {
        const errorObj = error as { message?: string };
        errorMessage = errorObj.message || "An unexpected error occurred.";
      }

      if (errorMessage === "Request failed with status code 404") {
        errorMessage = "File not found on server";
      }

      console.log("errorMessage-->", errorMessage);
      message.error(errorMessage);
      setDocumentDownloadError(errorMessage);
    } finally {
      setDownloadingFile(null);
      dispatch(stopLoading());
    }
  };

  const showAssessmentModal = (module: Module) => {
    setSelectedModule(module);
    setAssessmentModalVisible(true);
  };

  const assessmentColumns = [
    {
      title: "Question",
      dataIndex: "questionText",
      key: "questionText",
      width: "30%",
      render: (text: string) => (
        <div className="text-sm font-medium text-gray-800">{text}</div>
      ),
    },
    {
      title: "Options",
      key: "options",
      width: "15%",
      render: (record: AssessmentQuestion) => (
        <div className="grid grid-cols-2 gap-2">
          <div className="text-xs">
            <span className="font-medium">A:</span> {record.option1}
          </div>
          <div className="text-xs">
            <span className="font-medium">B:</span> {record.option2}
          </div>
          <div className="text-xs">
            <span className="font-medium">C:</span> {record.option3}
          </div>
          <div className="text-xs">
            <span className="font-medium">D:</span> {record.option4}
          </div>
          <div className="text-xs">
            <span className="font-medium">E:</span> {record.option5}
          </div>
        </div>
      ),
    },
    {
      title: "Correct Answer",
      key: "correctAnswer",
      width: "10%",
      render: (record: AssessmentQuestion) => {
        const options = ["A", "B", "C", "D", "E"];
        return (
          <Tag color="green" className="font-medium">
            {options[record.correctAnswer - 1]}
          </Tag>
        );
      },
    },
    {
      title: "Complexity",
      key: "complexity",
      width: "10%",
      render: (record: AssessmentQuestion) => (
        <Tag
          color={
            record.complexity === "easy"
              ? "green"
              : record.complexity === "medium"
              ? "orange"
              : "red"
          }
          className="capitalize"
        >
          {record.complexity}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: "10%",
      render: (record: AssessmentQuestion) => (
        <Tag
          color={record.status === "active" ? "green" : "red"}
          className="capitalize"
        >
          {record.status}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const certification = certificationDate?.content?.data as Certification | undefined;

  if (!certificateId) {
    return <div>Certification not found</div>;
  }
  if (!certification) {
    return <div>Certification not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden cert-details-page">
      <Breadcrumb path="Certification" subSubPath="Certification-details" />

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex-1">
            <span className="block break-words break-all">{certification.title}</span>
          </h1>
        </div>

        <main className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="bg-orange-100 p-4 rounded-2xl shadow-sm">
                <FileText size={94} className="text-primary" />
              </div>
              <div className="flex-1">
                <section className="mb-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed break-words break-all">
                    <span className="block break-words break-all whitespace-pre-wrap">
                      {certification.description}
                    </span>
                  </p>
                </section>
                <section>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                    Status
                  </h3>
                  {certification.status && (
                    <Tag
                      color={
                        certification.status === "active"
                          ? "green"
                          : certification.status === "inactive"
                          ? "gold"
                          : certification.status === "Pending"
                          ? "purple"
                          : "gray"
                      }
                      className="text-xs px-3 py-1 rounded-full capitalize shadow-sm"
                    >
                      {certification.status}
                    </Tag>
                  )}
                </section>
              </div>
            </div>

            <div className="space-y-6">
              {/* Assessment & Feedback Details */}
              <section>
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Assessment & Feedback Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Assessment Required
                    </p>
                    <Tag
                      color={
                        certification.isAssessmentRequired ? "green" : "red"
                      }
                      className="text-xs"
                    >
                      {certification.isAssessmentRequired ? "Yes" : "No"}
                    </Tag>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Feedback Required
                    </p>
                    <Tag
                      color={certification.isFeedbackRequired ? "green" : "red"}
                      className="text-xs"
                    >
                      {certification.isFeedbackRequired ? "Yes" : "No"}
                    </Tag>
                  </div>
                  {certification.isAssessmentRequired && (
                    <>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Assessment Time
                        </p>
                        <p className="text-gray-800 text-sm font-medium">
                          {certification.assessmentTime} minutes
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Pass Percentage
                        </p>
                        <p className="text-gray-800 text-sm font-medium">
                          {certification.passPercentage}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Validity & Interval Details */}
              <section>
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Validity & Interval Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {certification.interval_unit &&
                    certification.interval_value && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Interval Unit
                        </p>
                        <p className="text-gray-800 text-sm font-medium capitalize">
                          {certification.interval_unit}
                        </p>
                      </div>
                    )}
                  {certification.interval_value && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Interval Value
                      </p>
                      <p className="text-gray-800 text-sm font-medium">
                        {certification.interval_value}
                      </p>
                    </div>
                  )}
                  {certification.expiry_date && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Expiry Date
                      </p>
                      <p className="text-gray-800 text-sm font-medium">
                        {new Date(
                          certification.expiry_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {certification.CompanyModel && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Company
                      </p>
                      <p className="text-gray-800 text-sm font-medium break-words break-all">
                        {certification.CompanyModel.name}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Trainings Section */}
              {certification.trainings &&
                certification.trainings.length > 0 && (
                  <section>
                    <h3 className="text-base font-semibold text-gray-800 mb-4">
                      Trainings ({certification.trainings.length})
                    </h3>
                    <div className="space-y-4">
                      {certification.trainings.map((training: any) => (
                        <div
                          key={training.id}
                          className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                          {/* Training Header */}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                <h4 className="text-base font-semibold text-gray-800">
                                  <span className="break-words break-all">{training.trainingName}</span>
                                </h4>
                                <Tag
                                  color={
                                    training.status === "active"
                                      ? "green"
                                      : "red"
                                  }
                                  className="capitalize text-xs"
                                >
                                  {training.status}
                                </Tag>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="text-gray-500 break-all">
                                  Code: {training.trainingCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Training Modules */}
                          {training.TrainingModules &&
                            training.TrainingModules.length > 0 && (
                              <div className="mt-4">
                                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <FileDown className="h-3 w-3" />
                                  Modules ({training.TrainingModules.length})
                                </h5>
                                <div className="space-y-3">
                                  {training.TrainingModules.map(
                                    (trainingModule: any) => {
                                      const module = trainingModule.Module;
                                      return (
                                        <div
                                          key={module.id}
                                          className="bg-white border border-gray-200 rounded-lg p-3"
                                        >
                                          <div className="flex items-start justify-between gap-3 mb-3 w-full">
                                            <div className="min-w-0 flex-1">
                                              <h6 className="font-medium text-gray-800 text-sm">
                                                <span className="break-words break-all">{module.name}</span>
                                              </h6>
                                              <p className="text-xs text-gray-600">
                                                <span className="block break-words whitespace-pre-wrap">{module.description}</span>
                                              </p>
                                              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                                <span className="text-gray-500">
                                                  Order:{" "}
                                                  {trainingModule.moduleOrder}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Module Documents */}
                                          {module.Documents &&
                                            module.Documents.length > 0 && (
                                              <div className="space-y-2">
                                                {module.Documents.map(
                                                  (document: any) => (
                                                    <div
                                                      key={document.id}
                                                      className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                                                    >
                                                      <div className="flex items-start justify-between gap-2 mb-2 w-full">
                                                        <div className="min-w-0 flex-1">
                                                          <h6 className="font-medium text-gray-800 text-xs">
                                                            <span className="break-words break-all">{document.name}</span>
                                                          </h6>
                                                          <p className="text-xs text-gray-600">
                                                            <span className="block break-words whitespace-pre-wrap">{document.description}</span>
                                                          </p>
                                                        </div>
                                                        <Tag
                                                          color={
                                                            document.status ===
                                                            "active"
                                                              ? "green"
                                                              : "red"
                                                          }
                                                          className="self-start sm:self-center text-xs"
                                                        >
                                                          {document.status}
                                                        </Tag>
                                                      </div>

                                                      {/* Document Files */}
                                                      {document.files &&
                                                        document.files.length >
                                                          0 && (
                                                          <div className="space-y-1">
                                                            {document.files
                                                              .filter(
                                                                (file: any) =>
                                                                  file.status ===
                                                                  "active"
                                                              )
                                                              .map(
                                                                (file: any) => (
                                                                  <div
                                                                    key={
                                                                      file.id
                                                                    }
                                                                    className="flex items-center justify-between bg-white p-2 rounded border"
                                                                  >
                                                                    <div className="flex-1">
                                                                      <div className="text-xs font-medium text-gray-700 break-all">
                                                                        {file.filePath
                                                                          .split(
                                                                            "\\"
                                                                          )
                                                                          .pop()}
                                                                      </div>
                                                                      <div className="text-xs text-gray-500">
                                                                        Version:{" "}
                                                                        {
                                                                          file.version
                                                                        }{" "}
                                                                        |
                                                                        Created:{" "}
                                                                        {new Date(
                                                                          file.createdAt
                                                                        ).toLocaleDateString()}
                                                                      </div>
                                                                    </div>
                                                                    <Button
                                                                      type="primary"
                                                                      size="small"
                                                                      icon={
                                                                        <Download className="w-3 h-3" />
                                                                      }
                                                                      loading={
                                                                        downloadingFile ===
                                                                        file.id
                                                                      }
                                                                      onClick={() =>
                                                                        handleDownload(
                                                                          file.id,
                                                                          file.filePath,
                                                                          file.version,
                                                                          false, // isModuleFile = false
                                                                          undefined,
                                                                          document.id
                                                                        )
                                                                      }
                                                                      className="text-xs px-2 py-1"
                                                                    >
                                                                      Download
                                                                    </Button>
                                                                  </div>
                                                                )
                                                              )}
                                                          </div>
                                                        )}
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
            </div>
          </div>
        </main>
      </div>

      {/* Assessment Questions Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-800">
              Assessment Questions
            </span>
          </div>
        }
        open={assessmentModalVisible}
        onCancel={() => setAssessmentModalVisible(false)}
        footer={null}
        width={1000}
        className="assessment-modal"
        bodyStyle={{ padding: 24 }}
        style={{ top: 20 }}
      >
        {selectedModule && (
          <div>
            <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-4 text-base">
                Module Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-gray-600 block">Name:</span>
                  <p className="text-gray-800 font-medium">
                    {selectedModule.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-600 block">Time:</span>
                  <p className="text-gray-800 font-medium">
                    {selectedModule.allotedTimeMins} minutes
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-600 block">
                    Questions:
                  </span>
                  <p className="text-gray-800 font-medium">
                    {selectedModule.AssessmentQuestions?.length || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-600 block">
                    Status:
                  </span>
                  <Tag
                    color={selectedModule.status === "active" ? "green" : "red"}
                    className="font-medium"
                  >
                    {selectedModule.status}
                  </Tag>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Table
                dataSource={selectedModule.AssessmentQuestions || []}
                columns={assessmentColumns}
                rowKey="questionId"
                pagination={{
                  pageSize: 10,
                  // showSizeChanger: true,
                  // showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} questions`,
                  position: ["bottomCenter"],
                }}
                scroll={{ x: "max-content" }}
                className="assessment-table"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Document Download Error Modal */}
      <ErrorModal
        isOpen={!!documentDownloadError}
        title="Download Error"
        subtitle={documentDownloadError}
        onCancel={() => setDocumentDownloadError("")}
        onClose={() => setDocumentDownloadError("")}
      />

      <style>{`
        .assessment-modal .ant-modal-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 24px;
        }
        
        .assessment-modal .ant-modal-title {
          color: #1e293b;
          font-weight: 600;
        }
        
        .assessment-modal .ant-modal-close {
          color: #64748b;
        }
        
        .assessment-modal .ant-modal-close:hover {
          color: #1e293b;
        }
        
        .assessment-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #1e293b !important;
          font-weight: 600 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 16px !important;
        }
        
        .assessment-table .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #334155 !important;
        }
        
        .assessment-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        
        .assessment-table .ant-pagination-item {
          border-radius: 6px;
          border-color: #e2e8f0;
        }
        
        .assessment-table .ant-pagination-item-active {
          background: #3b82f6;
          border-color: #3b82f6;
        }
        
        .assessment-table .ant-pagination-item-active a {
          color: white;
        }

        /* Make buttons smaller on small screens within this page only */
        @media (max-width: 640px) {
          .cert-details-page .ant-btn {
            padding: 4px 10px !important;
            height: auto !important;
            font-size: 12px !important;
          }
          .cert-details-page .ant-btn > span {
            line-height: 1.1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificationDetails;
