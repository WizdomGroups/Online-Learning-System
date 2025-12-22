import { createSlice } from "@reduxjs/toolkit";
import {
  CertificationTransactionListResponse,
  fetchCertificationTransactionApiFunction,
} from "../../../lib/network/certificationTransactionApis";

interface CertificationTransactionState {
  data: CertificationTransactionListResponse['content'] | null;
  loading: boolean;
  error: string;
}

const certificationTransactionSlice = createSlice({
  name: "certificationTransaction",
  initialState: {
    data: null,
    loading: false,
    error: "",
  } as CertificationTransactionState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificationTransactionApiFunction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(
        fetchCertificationTransactionApiFunction.fulfilled,
        (state, action) => {
          state.loading = false;
          state.data = action.payload.content;
        }
      )
      .addCase(
        fetchCertificationTransactionApiFunction.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            typeof action.payload === "string"
              ? action.payload
              : "An error occurred.";
        }
      );
  },
});

export default certificationTransactionSlice.reducer;
