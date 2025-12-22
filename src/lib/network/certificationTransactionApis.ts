import { apiRequest } from "./apiRequest";
import axiosClient from "./axiosClient";
import {
  CERTIFICATION_LEARNER_PDF_URL,
  CERTIFICATION_TRANSACTION_APPROVE_URL,
  CERTIFICATION_TRANSACTION_URL,
} from "../endPoints";

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  startLoading,
  startTableDataLoading,
  stopLoading,
  stopTableDataLoading,
} from "../../store/features/globalConstant/loadingSlice";

// Base response interface
interface BaseResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
}

// New interfaces to add
interface Trainer {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  dob: string;
}

interface DocumentFile {
  id: number;
  filePath: string;
  version: number;
  location: string;
  status: string;
}

interface Document {
  id: number;
  name: string;
  description: string;
  status: string;
  createdBy: string;
  files: DocumentFile[];
  DocumentModule: {
    id: number;
    documentId: number;
    moduleId: number;
    createdDate: string;
    updatedDate: string;
  };
}

interface AssessmentQuestion {
  questionGroupId: string;
}

interface Module {
  id: number;
  name: string;
  description: string;
  assessment: boolean;
  feedback: boolean;
  allotedTimeMins: number;
  status: string;
  Documents: Document[];
  AssessmentQuestions: AssessmentQuestion[];
  CertificationModule: {
    id: number;
    certificationId: number;
    moduleId: number;
    createdDate: string;
    updatedDate: string;
  };
}

interface CertificationDetails {
  id: number;
  title: string;
  trimmedTitle: string;
  description: string;
  createdBy: string | null;
  status: string;
  totalAssessmentQuestions: number;
  assessmentTime: number;
  passPercentage: string;
  interval_unit: string;
  interval_value: number;
  expiry_date: string;
  createdAt: string;
  updatedAt: string;
  companyId: number;
  categoryId: number | null;
  Modules: Module[];
}

// Interface for individual certification transaction data
interface CertificationTransactionData {
  id: number;
  companyId: number;
  employeeId: number;
  employeeName: string;
  certificationId: number;
  status: string;
  certificationResult: string;
  departmentId: number;
  department: string;
  designationId: number;
  designation: string;
  assignedBy: number;
  assignedDate: string;
  completedDate: string | null;
  documentReadStatus: boolean;
  startDate: string | null;
  endDate: string | null;
  feedbackGiven: boolean;
  attempts: number;
  trainer: Trainer;
  questionGroupId: string | null;
  version: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  Certification: CertificationDetails;
}

// Interface for certification list pagination
interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interface for certification list response
export interface CertificationTransactionListResponse extends BaseResponse {
  content: {
    pagination: PaginationData;
    data: CertificationTransactionData[];
  };
}

// Interface for single certification transaction response
export interface CertificationTransactionByIdResponse extends BaseResponse {
  content: {
    result: CertificationTransactionData;
  };
}

export const fetchCertificationTransactionApiFunction = createAsyncThunk<
  CertificationTransactionListResponse,
  {
    pageSize: number;
    page: number;
    searchQuery?: string;
    status?: string;
    employeeId?: number;
    tenantId?: string;
  }
>(
  "certification/fetchCertificationDateApiFunction",
  async (
    { pageSize, page, searchQuery, status, employeeId, tenantId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startTableDataLoading());

      const params: Record<string, string | number> = {
        limit: pageSize,
        page,
      };

      if (searchQuery) params.search = searchQuery;
      if (status && status !== "all") params.status = status;
      if (employeeId) params.employeeId = employeeId;
      if (tenantId) params.tenantId = tenantId;

      const response = await apiRequest<CertificationTransactionListResponse>({
        method: "GET",
        url: CERTIFICATION_TRANSACTION_URL,
        params,
      });

      return response;
    } catch (error: unknown) {
      console.log("error -->", error);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error.response as { data?: { error?: string } })?.data?.error ||
            "Internal Server Error"
          : "Internal Server Error";
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

export const fetchCertificationTransactionByIdApiFunction = createAsyncThunk<
  CertificationTransactionByIdResponse,
  { certificateTransactionId: string }
>(
  "certification/fetchCertificationByIdApiFunction",
  async ({ certificateTransactionId }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startLoading());
      const response = await apiRequest<CertificationTransactionByIdResponse>({
        method: "GET",
        url: `${CERTIFICATION_TRANSACTION_URL}/${certificateTransactionId}`,
      });
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error.response as { data?: { error?: string } })?.data?.error ||
            "Internal Server Error"
          : "Internal Server Error";
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const CreateCertificationTransactionApiFunction = async ({
  formData,
}) => {
  return apiRequest({
    method: "POST",
    url: CERTIFICATION_TRANSACTION_URL,
    data: formData,
  });
};

export const updateCertificationTransactionApiFunction = async ({
  formData,
  certificationTransactionId,
}) => {
  return apiRequest({
    method: "PUT",
    url: `${CERTIFICATION_TRANSACTION_URL}/${certificationTransactionId}`,
    data: formData,
  });
};

export const approveEmployeeCertificationApiFUnction = async ({ formData }) => {
  return apiRequest({
    method: "POST",
    url: CERTIFICATION_TRANSACTION_APPROVE_URL,
    data: formData,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateCertificationStatusResultApiFunction = async ({
  certTransactionId,
  certificationResult,
  status,
}: {
  certTransactionId: number;
  certificationResult: string;
  status: string;
}) => {
  return apiRequest({
    method: "POST",
    url: `${CERTIFICATION_TRANSACTION_URL}/update-certification-status-result`,
    data: {
      certTransactionId,
      certificationResult,
      status,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Interface for the new JSON response structure
interface CertificationData {
  transaction: {
    id: number;
    employeeId: number;
    employeeName: string;
    department: string;
    designation: string;
    status: string;
    certificationResult: string;
    startDate: string | null;
    completedDate: string | null;
  };
  certification: {
    id: number;
    title: string;
    description: string;
    status: string;
  };
  company: {
    id: number;
    name: string;
    registrationNumber: string;
    gstNumber: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
  };
  assessmentResult: {
    id: number;
    score: number;
    percentage: number;
    totalQuestions: number;
    attemptedQuestions: number;
    rightAnswers: number;
    status: string;
    evaluationMode: string;
    attemptNumber: number;
    answerGroupId: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
}

interface CertificationPdfResponse extends BaseResponse {
  content: CertificationData;
}

export const downloadLearnerCertificationPdfApiFUnction = async ({
  certTransactionId,
  tenantId,
}: {
  certTransactionId: string;
  tenantId: string;
}) => {
  try {
    const response = await axiosClient.request<CertificationPdfResponse>({
      method: "GET",
      url: CERTIFICATION_LEARNER_PDF_URL,
      params: {
        certTransactionId,
        tenantId,
      },
    });

    return response; // Return the full response object with JSON data
  } catch (error: unknown) {
    // Handle different types of errors and provide specific messages
    if (error instanceof Error) {
      // If it's an axios error with response
      if ("response" in error && error.response) {
        const response = error.response as {
          status: number;
          data?: { message?: string; error?: string };
        };

        // Try to parse the response data to get the actual error message from backend
        let backendMessage = "";
        try {
          // If response.data is a blob, we need to read it as text first
          if (response.data instanceof Blob) {
            const text = await response.data.text();
            const parsedData = JSON.parse(text);
            backendMessage = parsedData.message || parsedData.error || "";
          } else if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            backendMessage = response.data.message || response.data.error || "";
          }
        } catch (parseError) {
          // If parsing fails, continue with default error handling
          console.warn("Failed to parse error response:", parseError);
        }

        // If we successfully extracted a backend message, use it immediately
        if (backendMessage) {
          throw new Error(backendMessage);
        }

        // Handle different HTTP status codes with fallback messages
        switch (response.status) {
          case 400:
            throw new Error(
              "Invalid request. Please check the certification details."
            );
          case 401:
            throw new Error(
              "You are not authorized to download this certificate."
            );
          case 403:
            throw new Error(
              "Access forbidden. You don't have permission to download this certificate."
            );
          case 404:
            throw new Error(
              "Certificate not found. The certification may not exist or has been removed."
            );
          case 500:
            throw new Error("PDF generation failed. Please try again later.");
          default:
            throw new Error(
              "Failed to generate certificate PDF. Please try again."
            );
        }
      }

      // If it's a network error
      if (
        error.message.includes("Network Error") ||
        error.message.includes("ERR_NETWORK")
      ) {
        throw new Error(
          "Network connection error. Please check your internet connection and try again."
        );
      }

      // If it's a timeout error
      if (error.message.includes("timeout")) {
        throw new Error("Request timed out. Please try again.");
      }

      // For other errors, use the original message
      throw new Error(
        error.message || "Failed to generate certificate PDF. Please try again."
      );
    }

    // For unknown error types
    throw new Error(
      "An unexpected error occurred while generating the certificate PDF. Please try again."
    );
  }
};
