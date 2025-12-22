import { createSlice } from "@reduxjs/toolkit";
import { 
  CertificationTransactionByIdResponse,
  fetchCertificationTransactionByIdApiFunction 
} from "../../../lib/network/certificationTransactionApis";

interface CertificationTransactionByIdState {
  data: CertificationTransactionByIdResponse['content']['result'] | null;
  loading: boolean;
  error: string;
}

const certificationTransactionByIdSlice = createSlice({
  name: "certificationTransactionById",
  initialState: {
    data: null,
    loading: false,
    error: "",
  } as CertificationTransactionByIdState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificationTransactionByIdApiFunction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(
        fetchCertificationTransactionByIdApiFunction.fulfilled,
        (state, action) => {
          state.loading = false;
          state.data = action.payload.content.result;
        }
      )
      .addCase(
        fetchCertificationTransactionByIdApiFunction.rejected,
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

export default certificationTransactionByIdSlice.reducer;
