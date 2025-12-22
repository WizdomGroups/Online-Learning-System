import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTrainingData, TrainingListResponse } from "../../../lib/network/trainingApi";

// Training state interface
interface TrainingState {
  data: TrainingListResponse | null;
  loading: boolean;
  error: string;
}

const initialState: TrainingState = {
  data: null,
  loading: false,
  error: "",
};

// Async thunk for fetching training data
export const fetchTrainingList = createAsyncThunk(
  "training/fetchTrainingList",
  async (params: {
    limit: number;
    page: number;
    search?: string;
    status?: string;
    tenantId?: string | number;
  }) => {
    const response = await fetchTrainingData(params);
    return response;
  }
);

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    clearTrainingData: (state) => {
      state.data = null;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingList.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchTrainingList.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTrainingList.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "An error occurred while fetching trainings.";
      });
  },
});

export const { clearTrainingData } = trainingSlice.actions;
export default trainingSlice.reducer;
