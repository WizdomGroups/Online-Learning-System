import { createSlice } from "@reduxjs/toolkit";
import { CompanyState } from "../../../lib/interface/company";
import { fetchCompaniesList } from "../../../lib/network/companyApi";

const initialState: CompanyState = {
  data: [],
  list: null,
  selected: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanyData: (state) => {
      state.data = [];
      state.list = null;
      state.selected = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompaniesList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.data = action.payload.content.result.data;
        state.pagination = action.payload.content.result.pagination;
      })
      .addCase(fetchCompaniesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch companies";
      });
  },
});

export const { clearCompanyData } = companySlice.actions;
export default companySlice.reducer;
