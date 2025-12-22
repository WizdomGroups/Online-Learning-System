import { createSlice } from "@reduxjs/toolkit";
import { fetchDocumentData } from "../../../lib/network/documentApis";
import { DocumentState } from "../../../lib/types/module";

const initialState: DocumentState = {
  data: null,
  loading: false,
  error: "",
};

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentData.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDocumentData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDocumentData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export default documentSlice.reducer;
