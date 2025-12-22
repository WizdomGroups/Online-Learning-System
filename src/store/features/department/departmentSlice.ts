import { createSlice } from "@reduxjs/toolkit";
import { fetchDepartmentApiFunction } from "../../../lib/network/departmentApis";
import { DepartmentListResponse } from "../../../lib/network/departmentApis";

interface DepartmentState {
  data: DepartmentListResponse["content"] | null;
  loading: boolean;
  error: string;
}

const initialState: DepartmentState = {
  loading: false,
  error: "",
  data: null,
};

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // List departments
      .addCase(fetchDepartmentApiFunction.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDepartmentApiFunction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.content;
      })
      .addCase(fetchDepartmentApiFunction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "An error occurred.";
      });
  },
});

export default departmentSlice.reducer;
