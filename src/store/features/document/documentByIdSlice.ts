import { createSlice } from "@reduxjs/toolkit";
import { fetchDocumentById } from "../../../lib/network/documentApis";
import { SingleDocumentResponse } from "../../../lib/types/module";

interface DocumentByIdState {
  data: SingleDocumentResponse | null;
  loading: boolean;
  error: string;
}

const initialState: DocumentByIdState = {
  data: null,
  loading: false,
  error: "",
};

const documentByIdSlice = createSlice({
  name: "documentById",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "";
      });
  },
});

export default documentByIdSlice.reducer;
