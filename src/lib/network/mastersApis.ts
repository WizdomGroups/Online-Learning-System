import { createAsyncThunk } from "@reduxjs/toolkit";
import { MASTERS_URL } from "../endPoints";
import { apiRequest } from "./apiRequest";

// Example async thunk to fetch dashboard data
export const fetchMastersData = createAsyncThunk(
  "masters/fetchMastersData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "GET",
        url: MASTERS_URL,
      });
      return response.content.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);
