import { createAsyncThunk } from "@reduxjs/toolkit";
import { MODULE_URL } from "../endPoints";
import {
  startLoading,
  startTableDataLoading,
  stopLoading,
  stopTableDataLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { ModuleResponse, SingleModuleResponse } from "../types/module";
import { apiRequest } from "./apiRequest";
import axiosClient from "./axiosClient";

export const fetchModuleData = createAsyncThunk<
  ModuleResponse,
  {
    limit: number;
    page: number;
    searchQuery?: string;
    status?: string;
    tenantId?: string | number;
    assessment?: string;
  }
>(
  "modules/fetchModuleData",
  async (
    { limit, page, searchQuery, status, tenantId, assessment },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startTableDataLoading());

      const params: Record<string, string | number> = { limit, page };
      if (searchQuery) params.searchQuery = searchQuery;
      if (status && status !== "all") params.status = status;
      if (tenantId && tenantId !== "all") params.tenantId = tenantId;
      if (assessment) params.assessment = assessment;
      const response = await apiRequest<ModuleResponse>({
        method: "GET",
        url: MODULE_URL,
        params,
      });

      return response;
    } catch (error: unknown) {
      console.log("error-->", error);
      return rejectWithValue(
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Internal Server Error"
      );
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

export const fetchModuleById = createAsyncThunk<
  SingleModuleResponse,
  { id: string }
>("modules/fetchModuleById", async ({ id }, { rejectWithValue, dispatch }) => {
  try {
    dispatch(startLoading());
    const response = await apiRequest<SingleModuleResponse>({
      method: "GET",
      url: `${MODULE_URL}/single/${id}`,
    });
    return response;
  } catch (error: unknown) {
    return rejectWithValue(
      (error as { response?: { data?: { error?: string } } })?.response?.data
        ?.error || "Internal Server Error"
    );
  } finally {
    dispatch(stopLoading());
  }
});

export const createModuleApiFunction = async (
  formData: FormData
): Promise<SingleModuleResponse> => {
  return apiRequest<SingleModuleResponse>({
    method: "POST",
    url: MODULE_URL,
    data: formData,
  });
};

export const updateModuleApiFunction = async (
  formData: FormData
): Promise<SingleModuleResponse> => {
  return apiRequest<SingleModuleResponse>({
    method: "PUT",
    url: MODULE_URL,
    data: formData,
  });
};

// Add file to module
export const addFileToModule = async (
  moduleId: string | number,
  formData: FormData
) => {
  return apiRequest({
    method: "POST",
    url: `${MODULE_URL}/${moduleId}/files`,
    data: formData,
  });
};

// Delete files from module
export const deleteFilesFromModule = async (
  moduleId: string | number,
  fileIds: number[]
) => {
  return apiRequest({
    method: "DELETE",
    url: `${MODULE_URL}/${moduleId}/files`,
    data: { fileIds },
  });
};

// Download module file
export const downloadModuleFile = async (
  moduleId: string | number,
  fileId: string | number
) => {
  const response = await axiosClient.request({
    method: "GET",
    url: `${MODULE_URL}/download/${moduleId}/file/${fileId}`,
    responseType: "blob",
  });
  return response.data;
};
