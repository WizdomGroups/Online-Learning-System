import { DEPARTMENT_URL } from "../endPoints";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { apiRequest } from "./apiRequest";

// Base response interface
interface BaseResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
}

// Department data interface
interface DepartmentData {
  id: number;
  name: string;
  description: string;
  deptTypeId: number;
  companyId: number;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for department list pagination
interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// Interface for the complete department list response
export interface DepartmentListResponse extends BaseResponse {
  content: {
    pagination: PaginationData;
    data: DepartmentData[];
  };
}

// Interface for the single department response
export interface DepartmentByIdResponse extends BaseResponse {
  content: DepartmentData;
}

export const fetchDepartmentApiFunction = createAsyncThunk<
  DepartmentListResponse,
  {
    limit: number;
    page: number;
    searchQuery?: string;
    status?: string;
    tenantId?: string;
  }
>(
  "department/fetchDepartmentApiFunction",
  async (
    { limit, page, searchQuery, status, tenantId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startLoading());

      const params: Record<string, string | number> = {
        limit,
        page,
      };
      if (searchQuery) params.search = searchQuery;
      if (tenantId) params.companyId = tenantId;
      if (status && status !== "all") params.status = status;

      const response = await apiRequest<DepartmentListResponse>({
        method: "GET",
        url: DEPARTMENT_URL,
        params,
      });

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { error?: string } })?.data?.error ||
            "Internal Server Error"
          : "Internal Server Error";
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const fetchDepartmentByIdApiFunction = createAsyncThunk<
  DepartmentByIdResponse,
  { departmentId: string }
>(
  "department/fetchDepartmentByIdApiFunction",
  async ({ departmentId }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startLoading());

      const response = await apiRequest<DepartmentByIdResponse>({
        method: "GET",
        url: `${DEPARTMENT_URL}/${departmentId}`,
      });

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as { data?: { error?: string } })?.data?.error ||
            "Internal Server Error"
          : "Internal Server Error";
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const createDepartmentApiFunction = async ({
  formData,
}: {
  formData: Partial<DepartmentData>;
}): Promise<DepartmentByIdResponse> => {
  return apiRequest<DepartmentByIdResponse>({
    method: "POST",
    url: DEPARTMENT_URL,
    data: formData,
  });
};

export const updateDepartmentApiFunction = async ({
  formData,
  departmentId,
}: {
  formData: Partial<DepartmentData>;
  departmentId: number;
}): Promise<DepartmentByIdResponse> => {
  return apiRequest<DepartmentByIdResponse>({
    method: "PUT",
    url: `${DEPARTMENT_URL}/${departmentId}`,
    data: formData,
  });
};
