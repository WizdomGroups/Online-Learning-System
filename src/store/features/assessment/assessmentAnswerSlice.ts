import { createSlice } from "@reduxjs/toolkit";
import {
  AssessmentQuestionsResponse,
  fetchAssessmentAnswerData,
} from "../../../lib/network/assessmentApis";

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

interface AssessmentAnswerResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  content: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    data: AssessmentAnswerSummary[];
  };
}

const assessmentAnswerSlice = createSlice({
  name: "assessmentAnswers",
  initialState: {
    data: null as AssessmentAnswerResponse | null,
    loading: false,
    error: "", // Ensure error is a string
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessmentAnswerData.pending, (state) => {
        state.loading = true;
        state.error = ""; // Clear previous error
      })
      .addCase(fetchAssessmentAnswerData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAssessmentAnswerData.rejected, (state, action) => {
        state.loading = false;
        // Ensure action.payload is a string or fallback to a default error message
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export default assessmentAnswerSlice.reducer;
