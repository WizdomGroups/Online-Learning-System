// import { createSlice } from "@reduxjs/toolkit";
// import { fetchDashboardData } from "../../../lib/network/dashboardApis";

// const feedbackSlice = createSlice({
//   name: "module",
//   initialState: {
//     data: null,
//     loading: false,
//     error: "", // This is fine if we expect error to be a string.
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true;
//         state.error = "";
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.data = action.payload;
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false;
//         // Ensure error is a string, if not, fallback to an empty string
//         state.error =
//           typeof action.payload === "string"
//             ? action.payload
//             : JSON.stringify(action.payload) || "";
//       });
//   },
// });

// export default feedbackSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchLearnerFeedbackById,
  fetchTrainerFeedbackById,
  fetchTrainerFeedbackByCertTransId,
  Feedback,
} from "../../../lib/network/feedbackApis";

interface FeedbackState {
  learnerFeedback: Feedback[] | null; // kept for compatibility
  trainerFeedback: Feedback[] | null; // kept for compatibility
  learnerFeedbackById: Feedback | null;
  trainerFeedbackById: Feedback | null;
  loading: boolean;
  error: string;
}

const initialState: FeedbackState = {
  learnerFeedback: null,
  trainerFeedback: null,
  learnerFeedbackById: null,
  trainerFeedbackById: null,
  loading: false,
  error: "",
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Note: list fetch reducers removed; properties retained for compatibility

    /* ==================== Learner Feedback By Id ==================== */
    builder
      .addCase(fetchLearnerFeedbackById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchLearnerFeedbackById.fulfilled, (state, action) => {
        state.loading = false;
        state.learnerFeedbackById = action.payload.content;
      })
      .addCase(fetchLearnerFeedbackById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch learner feedback by id";
      });

    /* ==================== Trainer Feedback By Id ==================== */
    builder
      .addCase(fetchTrainerFeedbackById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchTrainerFeedbackById.fulfilled, (state, action) => {
        state.loading = false;
        state.trainerFeedbackById = action.payload.content;
      })
      .addCase(fetchTrainerFeedbackById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch trainer feedback by id";
      });

    /* = Trainer Feedback By Certificate Transaction Id = */
    builder
      .addCase(fetchTrainerFeedbackByCertTransId.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchTrainerFeedbackByCertTransId.fulfilled, (state, action) => {
        state.loading = false;
        state.trainerFeedbackById = action.payload.content;
      })
      .addCase(fetchTrainerFeedbackByCertTransId.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch trainer feedback by certificate transaction id";
      });
  },
});

export default feedbackSlice.reducer;
