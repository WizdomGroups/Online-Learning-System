import { createSlice } from "@reduxjs/toolkit";
import { fetchCertificationDateApiFunction } from "../../../lib/network/certificationApi";
import { CertificationListResponse } from "../../../lib/network/certificationApi";

interface CertificationState {
  data: CertificationListResponse | null;
  loading: boolean;
  error: string;
}

const certificationSlice = createSlice({
  name: "certification",
  initialState: {
    data: null,
    loading: false,
    error: "",
  } as CertificationState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificationDateApiFunction.pending, (state) => {
        state.loading = true;
        state.error = ""; // Clear previous error
      })
      .addCase(fetchCertificationDateApiFunction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCertificationDateApiFunction.rejected, (state, action) => {
        state.loading = false;
        // Ensure payload is a string, or fallback to a default error message
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export default certificationSlice.reducer;
