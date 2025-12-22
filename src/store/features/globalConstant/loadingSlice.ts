import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingState {
  isLoading: boolean;
  isTableDataLoading: boolean;
}

const initialState: LoadingState = {
  isLoading: false,
  isTableDataLoading: false,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    startTableDataLoading(state) {
      state.isTableDataLoading = true;
    },
    stopTableDataLoading(state) {
      state.isTableDataLoading = false;
    },
    setTableDataLoading(state, action: PayloadAction<boolean>) {
      state.isTableDataLoading = action.payload;
    },
  },
});

export const {
  startLoading,
  stopLoading,
  setLoading,
  startTableDataLoading,
  stopTableDataLoading,
  setTableDataLoading,
} = loadingSlice.actions;
export default loadingSlice.reducer;
