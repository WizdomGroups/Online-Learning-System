import { apiRequest } from "./apiRequest";
import {
  ASSESSMENT_SUBMIT_URL,
  EXPORT_EXCEL_BY_MODULE_ID,
  GET_ASSESSMENT_ANSWERS,
  GET_ASSESSMENT_ANSWERS_BY_GROUP,
  GET_ASSESSMENTS_QUESTIONS_BY_MODULE_ID_GROUP_ID,
  GET_PAGINATED_ASSESSMENTS_BY_DISTINCT_GROUP,
  UPLOAD_OR_UPDATE_ASSESSMENT_QUESTIONS_BY_EXCEL,
} from "../endPoints";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  startLoading,
  startTableDataLoading,
  stopLoading,
  stopTableDataLoading,
} from "../../store/features/globalConstant/loadingSlice";

// Base response interface (similar to what we already have)
export interface BaseResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
}

// Interface for individual assessment summary
export interface AssessmentSummary {
  questionGroupId: string;
  moduleId: number;
  moduleName: string;
  moduleDescription: string;
  moduleStatus: string;
  questionCount: number;
}

// Interface for paginated assessment data
export interface PaginatedAssessmentData {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
  data: AssessmentSummary[];
}

// Interface for the complete assessment list response
export interface AssessmentListResponse extends BaseResponse {
  content: PaginatedAssessmentData;
}

// Interface for individual assessment question
export interface AssessmentQuestion {
  questionId: number;
  moduleId: number;
  version: number | null;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctAnswer: number;
  status: string;
  complexity: "easy" | "medium" | "hard";
  createdBy: string;
  questionGroupId: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for the assessment questions response
export interface AssessmentQuestionsResponse extends BaseResponse {
  content: {
    data: AssessmentQuestion[];
  };
}

// Assessment Answer List Interfaces
interface AssessmentAnswerSummary {
  answerGroupId: string;
  answerCount: number;
  latestCreatedAt: string;
  certTransactionId: number;
  employeeId: number;
  employeeName: string;
  status: string;
  documentReadStatus: number;
  transactionCreatedAt: string;
}

interface AssessmentAnswerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AssessmentAnswerContent {
  pagination: AssessmentAnswerPagination;
  data: AssessmentAnswerSummary[];
}

interface AssessmentAnswerResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  content: AssessmentAnswerContent;
}

interface AssessmentAnswerDetail {
  id: number;
  certTransactionId: number;
  moduleId: number;
  version: number | null;
  questionId: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctAnswer: number;
  tenantId: number | null;
  userAnswer: number;
  questionGroupId: string;
  answerGroupId: string;
  createdAt: string;
  updatedAt: string;
}

interface AssessmentAnswerByIdContent {
  result: AssessmentAnswerDetail[];
}

interface AssessmentAnswerByIdResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  content: {
    result: AssessmentAnswerDetail[];
  };
}

// Example async thunk to fetch dashboard data
export const fetchAssessmentData = createAsyncThunk<
  AssessmentListResponse,
  {
    pageSize: number;
    page: number;
    searchQuery: string;
    status: string;
    tenantId: string;
  }
>(
  "modules/fetchModuleData",
  async (
    { pageSize, page, searchQuery, status, tenantId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startTableDataLoading());
      const response = await apiRequest<AssessmentListResponse>({
        method: "GET",
        url: GET_PAGINATED_ASSESSMENTS_BY_DISTINCT_GROUP,
        params: {
          limit: pageSize,
          page,
          search: searchQuery.trim(),
          status,
          tenantId,
        },
      });
      return response;
    } catch (error: any) {
      console.log("error-->", error);
      return rejectWithValue(
        error.response?.data?.error || "Internal Server Error"
      );
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

export const fetchAssessmentQuestionsByModuleIdOrGroupId = createAsyncThunk<
  AssessmentQuestionsResponse,
  { moduleId?: string; questionGroupId?: string; certificationId?: string; status?: string }
>(
  "assessments/fetchAssessmentQuestionsByModuleIdOrGroupId",
  async (
    { moduleId, questionGroupId, certificationId, status },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startLoading());
      const response = await apiRequest<AssessmentQuestionsResponse>({
        method: "GET",
        url: GET_ASSESSMENTS_QUESTIONS_BY_MODULE_ID_GROUP_ID,
        params: {
          moduleId,
          questionGroupId,
          certificationId,
          status,
        },
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Internal Server Error"
      );
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const uploadOrUpdateAssessmentQuestionsByExcel = async (
  formData: FormData
) => {
  return apiRequest({
    method: "POST",
    url: UPLOAD_OR_UPDATE_ASSESSMENT_QUESTIONS_BY_EXCEL,
    data: formData,
  });
};

export const exportExcelByModuleIdApiFunction = ({
  moduleId,
  certificationId,
  tenantId,
}: {
  moduleId?: string;
  certificationId?: string;
  tenantId?: string;
}) => {
  // Build URL - use moduleId in path if provided (for backward compatibility)
  // Otherwise use base route and pass certificationId as query param
  let urlPath: string;
  if (moduleId && !certificationId) {
    // Legacy: moduleId in path
    urlPath = `${EXPORT_EXCEL_BY_MODULE_ID}/${moduleId}`;
  } else {
    // New: use base route, certificationId will be in query params
    urlPath = `${EXPORT_EXCEL_BY_MODULE_ID}`;
  }
  
  // Build query params
  const params: Record<string, string> = {};
  if (certificationId) params.certificationId = certificationId;
  if (tenantId) params.tenantId = tenantId;
  
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${urlPath}?${queryString}` : urlPath;
  
  return apiRequest({
    method: "GET",
    url,
    responseType: "blob",
  });
};

// Example async thunk to fetch dashboard data
export const fetchAssessmentAnswerData = createAsyncThunk<
  AssessmentAnswerResponse,
  {
    pageSize: number;
    page: number;
    searchQuery: string;
    status?: string;
    moduleId?: number;
    tenantId?: number;
    certTransactionId?: number;
  }
>(
  "assessment/fetchAssessmentAnswerData",
  async (
    {
      pageSize = 10,
      page = 1,
      searchQuery,
      status,
      moduleId,
      certTransactionId,
      tenantId,
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startTableDataLoading());

      const params: Record<string, any> = {
        limit: pageSize,
        page,
      };

      if (searchQuery) params.search = searchQuery;
      if (status) params.status = status;
      if (tenantId) params.tenantId = tenantId;
      if (moduleId !== undefined && moduleId !== null)
        params.moduleId = moduleId;
      if (certTransactionId !== undefined && certTransactionId !== null) {
        params.certTransactionId = certTransactionId;
      }

      const response = await apiRequest<AssessmentAnswerResponse>({
        method: "GET",
        url: GET_ASSESSMENT_ANSWERS,
        params,
      });

      return response;
    } catch (error: any) {
      console.log("error-->", error);
      return rejectWithValue(
        error.response?.data?.error || "Internal Server Error"
      );
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

export const fetchAssessmentAnswersByIdApiFunction = createAsyncThunk<
  AssessmentAnswerByIdResponse,
  {
    answerGroupId?: string;
    tenantId?: string;
    employeeId?: string;
    certTransactionId?: string;
  }
>(
  "certification/fetchCertificationByIdApiFunction",
  async (
    { answerGroupId, tenantId, employeeId, certTransactionId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startLoading());

      const params: Record<string, any> = {};
      if (answerGroupId) params.answerGroupId = answerGroupId;
      if (tenantId) params.tenantId = tenantId;
      if (employeeId) params.employeeId = employeeId;
      if (certTransactionId) params.certTransactionId = certTransactionId;

      const response = await apiRequest<AssessmentAnswerByIdResponse>({
        method: "GET",
        url: GET_ASSESSMENT_ANSWERS_BY_GROUP,
        params,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Internal Server Error"
      );
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const submitUserAssessmentApiFunction = async ({ formData }) => {
  return apiRequest({
    method: "POST",
    url: ASSESSMENT_SUBMIT_URL,
    data: formData,
  });
};
