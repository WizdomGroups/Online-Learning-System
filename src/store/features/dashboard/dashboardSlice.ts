import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDashboardData,
  fetchLMSDashboardStatistics,
  fetchAdminDashboardStatistics,
  DashboardStatistics,
  AdminDashboardStatistics,
} from "../../../lib/network/dashboardApis";

interface DashboardState {
  data: unknown | null;
  loading: boolean;
  error: string;
  lmsStatistics: DashboardStatistics | null;
  lmsLoading: boolean;
  lmsError: string;
  adminStatistics: AdminDashboardStatistics | null;
  adminLoading: boolean;
  adminError: string;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: "",
  lmsStatistics: null,
  lmsLoading: false,
  lmsError: "",
  adminStatistics: null,
  adminLoading: false,
  adminError: "",
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearLMSData: (state) => {
      state.lmsStatistics = null;
      state.lmsError = "";
    },
    clearAdminData: (state) => {
      state.adminStatistics = null;
      state.adminError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Original dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      })
      // LMS Dashboard Statistics
      .addCase(fetchLMSDashboardStatistics.pending, (state) => {
        state.lmsLoading = true;
        state.lmsError = "";
      })
      .addCase(fetchLMSDashboardStatistics.fulfilled, (state, action) => {
        state.lmsLoading = false;
        state.lmsStatistics = action.payload?.content || action.payload;
      })
      .addCase(fetchLMSDashboardStatistics.rejected, (state, action) => {
        state.lmsLoading = false;
        state.lmsError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to fetch dashboard statistics.";
      })
      // Admin dashboard statistics
      .addCase(fetchAdminDashboardStatistics.pending, (state) => {
        state.adminLoading = true;
        state.adminError = "";
      })
      .addCase(fetchAdminDashboardStatistics.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminStatistics = action.payload?.content || action.payload;
      })
      .addCase(fetchAdminDashboardStatistics.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to fetch admin dashboard statistics.";
      });
  },
});

export const { clearLMSData, clearAdminData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
