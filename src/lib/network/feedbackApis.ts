import { createAsyncThunk } from "@reduxjs/toolkit";
import { FEEDBACK_URL } from "../endPoints";
import {
  startTableDataLoading,
  stopTableDataLoading,
} from "../../store/features/globalConstant/loadingSlice";
import { apiRequest } from "./apiRequest";

export interface Employee {
  id: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  mobile: string;
  empCode: string;
  departmentId: number;
  designationId: number;
  companyId: number;
  branchId: number;
  roleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: number;
  employeeId: number;
  feedbackBy: "trainer" | "learner";
  tenantId: number;
  rating: number;
  feedbackText: string;
  createdAt: string;
  updatedAt: string;
  employee: Employee;
}

export interface FeedbackResponse {
  code: number;
  error: boolean;
  message: string;
  content: Feedback[];
}

export interface SingleFeedbackResponse {
  code: number;
  error: boolean;
  message: string;
  content: Feedback;
}

/* =========================================================
  GET Learner Feedback by Feedback ID
  ========================================================= */
export const fetchLearnerFeedbackById = createAsyncThunk<
  SingleFeedbackResponse,
  { feedbackId: number | string; tenantId: number | string },
  { rejectValue: string }
>(
  "feedback/fetchLearnerFeedbackById",
  async ({ feedbackId, tenantId }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startTableDataLoading());
      const response = await apiRequest<SingleFeedbackResponse>({
        method: "GET",
        url: `${FEEDBACK_URL}/learner/by-id/${feedbackId}`,
        params: { tenantId },
      });
      return response;
    } catch (error: unknown) {
      console.error("Learner feedback by-id error →", error);
      return rejectWithValue("Failed to fetch learner feedback by id");
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

/* =========================================================
  GET Trainer Feedback by Feedback ID
  ========================================================= */
export const fetchTrainerFeedbackById = createAsyncThunk<
  SingleFeedbackResponse,
  { feedbackId: number | string; tenantId: number | string },
  { rejectValue: string }
>(
  "feedback/fetchTrainerFeedbackById",
  async ({ feedbackId, tenantId }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startTableDataLoading());
      const response = await apiRequest<SingleFeedbackResponse>({
        method: "GET",
        url: `${FEEDBACK_URL}/trainer/by-id/${feedbackId}`,
        params: { tenantId },
      });
      return response;
    } catch (error: unknown) {
      console.error("Trainer feedback by-id error →", error);
      return rejectWithValue("Failed to fetch trainer feedback by id");
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

/* =========================================================
  GET Trainer Feedback by Certificate Transaction ID
  ========================================================= */
export const fetchTrainerFeedbackByCertTransId = createAsyncThunk<
  SingleFeedbackResponse,
  { certTransId: number | string; tenantId: number | string },
  { rejectValue: string }
>(
  "feedback/fetchTrainerFeedbackByCertTransId",
  async ({ certTransId, tenantId }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(startTableDataLoading());
      const response = await apiRequest<SingleFeedbackResponse>({
        method: "GET",
        url: `${FEEDBACK_URL}/trainer/by-cert-trans/${certTransId}`,
        params: { tenantId },
      });
      return response;
    } catch (error: unknown) {
      console.error("Trainer feedback by certTransId error →", error);
      return rejectWithValue("Failed to fetch trainer feedback by certificate transaction id");
    } finally {
      dispatch(stopTableDataLoading());
    }
  }
);

/* =========================================================
   📘 POST Create Feedback
========================================================= */
export interface CreateFeedbackRequest {
  employeeId: number;
  feedbackBy: "trainer" | "learner";
  tenantId: number;
  certificateTransId: number;
  rating: number;
  feedbackText: string;
}

export const createFeedbackApiFunction = async (
  feedbackData: CreateFeedbackRequest
) => {
  console.log("=== FEEDBACK API DEBUG ===");
  console.log("FEEDBACK_URL:", FEEDBACK_URL);
  console.log("Feedback data being sent:", feedbackData);
  
  try {
    const response = await apiRequest({
      method: "POST",
      url: FEEDBACK_URL,
      data: feedbackData,
    });
    console.log("Feedback API response:", response);
    return response;
  } catch (error) {
    console.error("Feedback API error:", error);
    throw error;
  }
};
