import { createSlice } from "@reduxjs/toolkit";
import { fetchMastersData } from "../../../lib/network/mastersApis";

// Define the state type explicitly
interface MastersState {
  data: any | null;
  loading: boolean;
  error: string | null; // Allow both string and null
}

const mastersSlice = createSlice({
  name: "masters",
  initialState: {
    data: null,
    loading: false,
    error: null, // The error is either string or null
  } as MastersState, // Explicitly set the type for initial state
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMastersData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMastersData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMastersData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Something went wrong"; // Ensure string type for error
        state.data = null;
      });
  },
});

export default mastersSlice.reducer;
