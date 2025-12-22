import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAssessmentQuestionsByModuleIdOrGroupId,
  AssessmentQuestionsResponse,
} from "../../../lib/network/assessmentApis";

const assessmentQuestionsSlice = createSlice({
  name: "assessmentQuestions",
  initialState: {
    data: null as AssessmentQuestionsResponse | null,
    loading: false,
    error: "", // Ensure error is a string
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessmentQuestionsByModuleIdOrGroupId.pending, (state) => {
        state.loading = true;
        state.error = ""; // Clear previous error
      })
      .addCase(
        fetchAssessmentQuestionsByModuleIdOrGroupId.fulfilled,
        (state, action) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(
        fetchAssessmentQuestionsByModuleIdOrGroupId.rejected,
        (state, action) => {
          state.loading = false;
          // Ensure action.payload is a string or fallback to a default error message
          state.error =
            typeof action.payload === "string"
              ? action.payload
              : "An error occurred.";
        }
      );
  },
});

export default assessmentQuestionsSlice.reducer;
