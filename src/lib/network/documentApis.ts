import { createAsyncThunk } from "@reduxjs/toolkit";
import { DOCUMENT_URL } from "../endPoints";
import { SingleDocumentResponse } from "../types/module";
import {
  startLoading,
  startTableDataLoading,
  stopLoading,
  stopTableDataLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { apiRequest } from "./apiRequest";
import axiosClient from "./axiosClient";

export const fetchDocumentData = createAsyncThunk(
  "documents/fetchDocumentData",
  async (
    {
      limit,
      page,
      searchQuery,
      status,
      tenantId,
    }: {
      limit: number;
      page: number;
      searchQuery?: string;
      status?: string;
      tenantId?: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      dispatch(startTableDataLoading());

      const params: Record<string, string | number> = { limit, page };

      if (searchQuery) params.searchQuery = searchQuery;
      if (status && status !== "all") params.status = status;
      if (tenantId && tenantId !== "all") params.tenantId = tenantId;
      const response = await apiRequest({
        method: "GET",
        url: DOCUMENT_URL,
        params,
      });

      return response.content || null;
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

export const fetchDocumentById = createAsyncThunk<
  SingleDocumentResponse,
  { id: string },
  { rejectValue: string }
>(
  "documents/fetchDocumentById",
  async ({ id }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startLoading());
      const response = await apiRequest<SingleDocumentResponse>({
        method: "GET",
        url: `${DOCUMENT_URL}/single/${id}`,
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
  }
);

export const createDocumentApiFunction = async (formData: FormData) => {
  return apiRequest({
    method: "POST",
    url: DOCUMENT_URL,
    data: formData,
  });
};

export const updateDocumentApiFunction = async (formData: FormData) => {
  return apiRequest({
    method: "PUT",
    url: DOCUMENT_URL,
    data: formData,
  });
};

export const downloadDocumentAttachment = async (
  documentId: string | number,
  fileId: string | number
) => {
  const response = await axiosClient.request({
    method: "GET",
    url: `${DOCUMENT_URL}/download/${documentId}/file/${fileId}`,
    responseType: "blob",
  });
  return response.data;
};

// Enhanced file management APIs

export const addFileToDocument = async (
  documentId: string | number,
  formData: FormData
) => {
  return apiRequest({
    method: "POST",
    url: `${DOCUMENT_URL}/${documentId}/files`,
    data: formData,
  });
};

export const deleteFilesFromDocument = async (
  documentId: string | number,
  fileIds: number[]
) => {
  return apiRequest({
    method: "DELETE",
    url: `${DOCUMENT_URL}/${documentId}/files`,
    data: { fileIds },
  });
};
