import { createSlice } from "@reduxjs/toolkit";
import { SingleEmployeeResponse } from "../../../lib/types/module";
import { fetchEmployeeById } from "../../../lib/network/employeeApis";

interface EmployeeByIdState {
  data: SingleEmployeeResponse | null;
  loading: boolean;
  error: string;
}

const initialState: EmployeeByIdState = {
  data: null,
  loading: false,
  error: "",
};

const employeeByIdSlice = createSlice({
  name: "employeeById",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export default employeeByIdSlice.reducer;
