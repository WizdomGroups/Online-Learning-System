import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "./apiRequest";
import { LMS_DASHBOARD_STATISTICS_URL } from "../endPoints";

// Interface for employee dashboard statistics response
export interface DashboardStatistics {
  certifications: {
    Total: number;
    Assigned: number;
    "Re-assigned": number;
    Completed: number;
    "In-progress": number;
    Expired: number;
    Cancelled: number;
    Review: number;
  };
  assessments: {
    TotalTaken: number;
    Passed: number;
    Failed: number;
    AverageScore: number;
    TotalAttempts: number;
  };
  filters: {
    tenantId: string;
    employeeId: string;
  };
}

// Interface for admin dashboard statistics response
export interface AdminDashboardStatistics {
  totalEmployees: number;
  totalModules: number;
  totalDocuments: number;
  totalCertificates: number;
  certifications: {
    Total: number;
    Assigned: number;
    "Re-assigned": number;
    Completed: number;
    "In-progress": number;
    Expired: number;
    Cancelled: number;
    Review: number;
  };
  assessments: {
    Pass: number;
    Fail: number;
    Incomplete: number;
    Cancelled: number;
    Timeout: number;
    SystemError: number;
  };
  filters: {
    tenantId: string;
    employeeId: string;
  };
}

// API function to fetch LMS dashboard statistics (Employee)
export const fetchLMSDashboardStatistics = createAsyncThunk(
  "dashboard/fetchLMSDashboardStatistics",
  async (
    params: { tenantId: string; employeeId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiRequest({
        method: "GET",
        url: `${LMS_DASHBOARD_STATISTICS_URL}?tenantId=${params.tenantId}&employeeId=${params.employeeId}`,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// API function to fetch Admin LMS dashboard statistics
export const fetchAdminDashboardStatistics = createAsyncThunk(
  "dashboard/fetchAdminDashboardStatistics",
  async (params: { tenantId: string }, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "GET",
        url: `${LMS_DASHBOARD_STATISTICS_URL}?tenantId=${params.tenantId}`,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Example async thunk to fetch dashboard data (keeping for backward compatibility)
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest({
        method: "GET",
        url: "/api/dashboard",
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
