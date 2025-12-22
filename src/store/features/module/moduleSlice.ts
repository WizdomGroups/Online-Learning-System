import { createSlice } from "@reduxjs/toolkit";
import {
  fetchModuleData,
  fetchModuleById,
} from "../../../lib/network/moduleApi";
import { ModuleState } from "../../../lib/types/module";

const initialState: ModuleState = {
  data: {
    code: 0,
    error: false,
    message: "",
    exception: "",
    data: [],
    content: {
      data: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
        },
      },
    },
  },
  moduleById: null,
  loading: false,
  error: "",
};

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    clearModuleData: (state) => {
      state.data = initialState.data;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModuleData.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchModuleData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchModuleData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      })
      .addCase(fetchModuleById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchModuleById.fulfilled, (state, action) => {
        state.loading = false;
        state.moduleById = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred.";
      });
  },
});

export const { clearModuleData } = moduleSlice.actions;
export default moduleSlice.reducer;
