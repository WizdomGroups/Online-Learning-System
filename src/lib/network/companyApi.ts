import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  CompanyListResponse,
  SingleCompanyResponse,
  CreateCompanyPayload,
} from "../interface/company";

import { apiRequest } from "./apiRequest";
import { COMPANY_URL } from "../endPoints";
import {
  startLoading,
  stopLoading,
} from "../../store/features/globalConstant/loadingSlice";

interface FetchCompanyListParams {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
}

export const fetchCompaniesList = createAsyncThunk<
  CompanyListResponse,
  FetchCompanyListParams,
  { rejectValue: string }
>(
  "company/fetchCompanies",
  async (params, { rejectWithValue, dispatch, getState }) => {
    dispatch(startLoading());
    try {
      const token = (getState() as { auth?: { token?: string } }).auth?.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await apiRequest<CompanyListResponse>({
        method: "GET",
        url: COMPANY_URL,
        params,
        headers,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch companies");
    } finally {
      dispatch(stopLoading());
    }
  }
);

export const fetchCompanyById = createAsyncThunk<
  SingleCompanyResponse,
  number,
  { rejectValue: string }
>("company/fetchCompanyById", async (id, { rejectWithValue, dispatch }) => {
  dispatch(startLoading());
  try {
    const response = await apiRequest<SingleCompanyResponse>({
      method: "GET",
      url: `${COMPANY_URL}/${id}`,
    });
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch company");
  } finally {
    dispatch(stopLoading());
  }
});

// Create designation
export const createCompanyApiFunction = async (
  formData: CreateCompanyPayload
) => {
  try {
    const response = await apiRequest<SingleCompanyResponse>({
      method: "POST",
      url: COMPANY_URL,
      data: formData,
    });
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create company");
  }
};

// Update designation
export const updateCompanyApiFunction = async ({ companyId, formData }) => {
  try {
    const response = await apiRequest<SingleCompanyResponse>({
      method: "PUT",
      url: `${COMPANY_URL}/${companyId}`,
      data: formData,
    });
    return response;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update company");
  }
};

export const deleteCompany = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>("company/deleteCompany", async (id, { rejectWithValue, dispatch }) => {
  dispatch(startLoading());
  try {
    await apiRequest({
      method: "DELETE",
      url: `${COMPANY_URL}/${id}`,
    });
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete company");
  } finally {
    dispatch(stopLoading());
  }
});
