import { createSlice } from "@reduxjs/toolkit";
import { EmployeesState } from "../../../lib/types/module";
import { fetchEmployeeData } from "../../../lib/network/employeeApis";

const initialState: EmployeesState = {
  data: null,
  loading: false,
  error: "",
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearEmployeeData: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeData.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchEmployeeData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchEmployeeData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export const { clearEmployeeData } = employeesSlice.actions;
export default employeesSlice.reducer;