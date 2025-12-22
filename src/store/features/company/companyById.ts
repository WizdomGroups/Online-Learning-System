import { createSlice } from "@reduxjs/toolkit";
import { CompanyState } from "../../../lib/interface/company";
import { fetchCompanyById } from "../../../lib/network/companyApi";

// Initial state
const initialState: CompanyState = {
  list: null,
  selected: null,
  data: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  },
};

const companyByIdSlice = createSlice({
  name: "companyById",
  initialState,
  reducers: {
    clearCompanyData: (state) => {
      state.data = [];
      state.error = null;
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCompanyData } = companyByIdSlice.actions;
export default companyByIdSlice.reducer;
