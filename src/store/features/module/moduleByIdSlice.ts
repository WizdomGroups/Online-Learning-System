import { createSlice } from "@reduxjs/toolkit";
import { fetchModuleById } from "../../../lib/network/moduleApi";
import { SingleModuleResponse } from "../../../lib/types/module";

interface ModuleByIdState {
  data: SingleModuleResponse | null;
  loading: boolean;
  error: string;
}

const initialState: ModuleByIdState = {
  data: null,
  loading: false,
  error: "",
};

const moduleByIdSlice = createSlice({
  name: "moduleById",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModuleById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchModuleById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "An error occurred.";
      });
  },
});

export default moduleByIdSlice.reducer;
