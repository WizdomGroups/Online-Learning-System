import { apiRequest } from "./apiRequest";
import {
  CERTIFICATION_RE_ASSIGNED_URL,
  CERTIFICATION_URL,
  CERTIFICATION_WITHOUT_ASSESSMENT_URL,
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

// Company interface
interface CompanyModel {
  id: number;
  name: string;
  branch?: string;
}

// Module interface
interface Module {
  id: number;
  name: string;
  allotedTimeMins: number;
}

// Interface for individual certification data
interface CertificationData {
  id: number;
  title: string;
  trimmedTitle: string;
  description: string;
  createdBy: string | null;
  status: string;
  isAssessmentRequired: boolean;
  isRecurring: boolean;
  isFeedbackRequired: boolean;
  totalAssessmentQuestions: number;
  assessmentTime: number;
  passPercentage: string;
  interval_unit: string | null;
  interval_value: number | null;
  expiry_date: string | null;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
  companyId: number | null;
  categoryId: number | null;
  MasterCertificationType: unknown | null;
  CompanyModel: CompanyModel;
  trainingIds?: number[];
  Trainings?: Array<{
    id: number;
    trainingName: string;
    trainingCode: string;
  }>;
  trainings?: Array<{
    id: number;
    trainingName: string;
    trainingCode: string;
    status: string;
    TrainingModules: Array<{
      id: number;
      moduleOrder: number;
      Module: {
        id: number;
        name: string;
        description: string;
        Documents: Array<{
          id: number;
          name: string;
          description: string;
          status: string;
          createdBy: string;
          createdDate: string;
          updatedDate: string | null;
          files: Array<{
            id: number;
            filePath: string;
            version: number;
            location: string;
            status: string;
            createdAt: string;
            updatedAt: string | null;
          }>;
          securityType: {
            id: number;
            name: string;
            description: string | null;
          };
          ModuleDocuments: {
            id: number;
            documentId: number;
            moduleId: number;
            createdAt: string;
            updatedAt: string;
          };
        }>;
      };
    }>;
    CertificationTraining: {
      id: number;
      certificationId: number;
      trainingId: number;
      tenantId: number;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }>;
}

// Interface for certification list pagination
interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interface for the complete certification list response
export interface CertificationListResponse extends BaseResponse {
  content: {
    pagination: PaginationData;
    data: CertificationData[];
  };
}

// Interface for single certification response (by ID)
interface CertificationDetailData extends CertificationData {
  tenantId: number;
  Modules: Module[];
}

// Interface for the certification by ID response
export interface CertificationByIdResponse extends BaseResponse {
  content: {
    data: CertificationDetailData;
  };
}

export const fetchCertificationDateApiFunction = createAsyncThunk<
  CertificationListResponse,
  {
    pageSize: number;
    page: number;
    searchQuery?: string;
    status?: string;
    tenantId?: string;
  }
>(
  "certification/fetchCertificationDateApiFunction",
  async (
    { pageSize, page, searchQuery, status, tenantId },
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
      if (tenantId && tenantId !== "all") params.tenantId = Number(tenantId);

      const response = await apiRequest<CertificationListResponse>({
        method: "GET",
        url: CERTIFICATION_URL,
        params,
      });

      return response;
    } catch (error: unknown) {
      console.log("error -->", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string; error?: string } })?.data?.message ||
            (error.response as { data?: { message?: string; error?: string } })?.data?.error ||
            "Internal Server Error"
          : "Internal Server Error";
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

export const fetchCertificationByIdApiFunction = createAsyncThunk<
  CertificationByIdResponse,
  { certificateId: string }
>(
  "certification/fetchCertificationByIdApiFunction",
  async ({ certificateId }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startLoading());
      const response = await apiRequest<CertificationByIdResponse>({
        method: "GET",
        url: `${CERTIFICATION_URL}/${certificateId}`,
      });
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { message?: string; error?: string } })?.data?.message ||
            (error.response as { data?: { message?: string; error?: string } })?.data?.error ||
            "Internal Server Error"
          : "Internal Server Error";
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const CreateCertificationApiFunction = async ({
  formData,
}: {
  formData: Record<string, unknown>;
}) => {
  return apiRequest({
    method: "POST",
    url: CERTIFICATION_URL,
    data: formData,
  });
};

export const updateCertificationApiFunction = async ({
  formData,
  certificateId,
}: {
  formData: Record<string, unknown>;
  certificateId: string;
}) => {
  return apiRequest({
    method: "PUT",
    url: `${CERTIFICATION_URL}/${certificateId}`,
    data: formData,
  });
};

export const reAssignedCertificationApiFunction = async ({
  formData,
}: {
  formData: unknown[]; // Or specify a type like Array<{ [key: string]: any }>
}) => {
  return apiRequest({
    method: "POST",
    url: CERTIFICATION_RE_ASSIGNED_URL,
    data: formData,
  });
};

// Fetch certifications without assessments
export const fetchCertificationsWithoutAssessment = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  status?: string;
  isAssessmentRequired?: boolean | string;
  tenantId?: string | number;
}) => {
  return apiRequest({
    method: "GET",
    url: CERTIFICATION_WITHOUT_ASSESSMENT_URL,
    params,
  });
};
