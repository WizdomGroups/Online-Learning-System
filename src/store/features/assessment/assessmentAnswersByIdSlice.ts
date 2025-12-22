import { createSlice } from "@reduxjs/toolkit";
import { fetchAssessmentAnswersByIdApiFunction } from "../../../lib/network/assessmentApis";

interface CertificationTransactionModel {
  id: number;
  employeeId: number;
  employeeName: string;
  status: string;
  certificationResult: string;
}

interface AssessmentAnswerDetail {
  id: number;
  certTransactionId: number;
  moduleId: number;
  version: number | null;
  questionId: number;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctAnswer: number;
  tenantId: number | null;
  userAnswer: number;
  questionGroupId: string;
  answerGroupId: string;
  createdAt: string;
  updatedAt: string;
  CertificationTransactionModel?: CertificationTransactionModel;
}

interface AssessmentAnswerByIdResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  content: {
    result: AssessmentAnswerDetail[];
  };
}

const assessmentAnswerByIdSlice = createSlice({
  name: "assessmentAnswerById",
  initialState: {
    data: null as AssessmentAnswerByIdResponse | null,
    loading: false,
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessmentAnswersByIdApiFunction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchAssessmentAnswersByIdApiFunction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAssessmentAnswersByIdApiFunction.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "An error occurred.";
      });
  },
});

export default assessmentAnswerByIdSlice.reducer;
