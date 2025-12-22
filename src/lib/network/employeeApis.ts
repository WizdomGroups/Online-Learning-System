import { createAsyncThunk } from "@reduxjs/toolkit";
import { EMPLOYEE_URL } from "../endPoints";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { EmployeeResponse, SingleEmployeeResponse } from "../types/module";
import { apiRequest } from "./apiRequest";

export const fetchEmployeeData = createAsyncThunk<
  EmployeeResponse,
  {
    limit: number;
    page: number;
    searchQuery?: string;
    status?: string;
    departmentIds?: string;
    tenantId?: string;
  }
>(
  "Employees/fetchEmployeeData",
  async (
    { limit, page, searchQuery, status, departmentIds, tenantId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startLoading());

      const params: Record<string, string | number> = { limit, page };
      if (searchQuery) params.search = searchQuery;
      if (departmentIds) params.departmentIds = departmentIds;
      if (tenantId) params.tenantIds = tenantId;
      if (status && status !== "all") params.status = status;

      const response = await apiRequest<EmployeeResponse>({
        method: "GET",
        url: EMPLOYEE_URL,
        params,
      });

      return response;
    } catch (error: unknown) {
      console.log("error-->", error);
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

export const fetchEmployeeById = createAsyncThunk<
  SingleEmployeeResponse,
  { id: string }
>(
  "Employees/fetchEmployeeById",
  async ({ id }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startLoading());
      const response = await apiRequest<SingleEmployeeResponse>({
        method: "GET",
        url: `${EMPLOYEE_URL}/single/${id}`,
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

export const createEmployeeApiFunction = async (
  formData: FormData
): Promise<SingleEmployeeResponse> => {
  return apiRequest<SingleEmployeeResponse>({
    method: "POST",
    url: EMPLOYEE_URL,
    data: formData,
  });
};

export const updateEmployeeApiFunction = async (
  formData: FormData
): Promise<SingleEmployeeResponse> => {
  return apiRequest<SingleEmployeeResponse>({
    method: "PUT",
    url: EMPLOYEE_URL,
    data: formData,
  });
};
