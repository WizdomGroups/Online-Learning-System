import { createSlice } from "@reduxjs/toolkit";
import { fetchAssessmentData } from "../../../lib/network/assessmentApis";
import { AssessmentListResponse } from "../../../lib/network/assessmentApis";

const assessmentSlice = createSlice({
  name: "assessments",
  initialState: {
    data: null as AssessmentListResponse | null,
    loading: false,
    error: "", // Ensure error is a string
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessmentData.pending, (state) => {
        state.loading = true;
        state.error = ""; // Clear previous error
      })
      .addCase(fetchAssessmentData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAssessmentData.rejected, (state, action) => {
        state.loading = false;
        // Ensure action.payload is a string or fallback to a default error message
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export default assessmentSlice.reducer;
