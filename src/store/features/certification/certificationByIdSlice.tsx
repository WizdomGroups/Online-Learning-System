import { createSlice } from "@reduxjs/toolkit";
import { fetchCertificationByIdApiFunction } from "../../../lib/network/certificationApi";
import { CertificationByIdResponse } from "../../../lib/network/certificationApi";

interface CertificationByIdState {
  data: CertificationByIdResponse | null;
  loading: boolean;
  error: string;
}

const certificationByIdSlice = createSlice({
  name: "certificationById",
  initialState: {
    data: null,
    loading: false,
    error: "",
  } as CertificationByIdState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificationByIdApiFunction.pending, (state) => {
        state.loading = true;
        state.error = ""; // Clear previous error
      })
      .addCase(fetchCertificationByIdApiFunction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCertificationByIdApiFunction.rejected, (state, action) => {
        state.loading = false;
        // Ensure payload is a string, or fallback to a default error message
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export default certificationByIdSlice.reducer;
