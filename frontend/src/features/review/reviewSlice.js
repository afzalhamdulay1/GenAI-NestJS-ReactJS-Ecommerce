import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Async Thunks

// Create a New Review
export const createNewReview = createAsyncThunk(
  'reviews/createNewReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put('/review', reviewData, config);
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch All Reviews for a Product
export const getAllReviews = createAsyncThunk(
  'reviews/getAllReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/reviews?id=${productId}`);
      return data.reviews;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ reviewId, productId }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete('/reviews', {
        params: {
          id: reviewId,
          productId: productId,
        },
      });
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);


// Update a Review
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put(`/review/${reviewId}`, reviewData, config);
      return data.success;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Review Slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    loading: false,
    success: false,
    error: null,
    reviews: [], // For storing all reviews for a product
    isDeleted: false,
    isUpdated: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetReviewState: (state) => {
      state.success = false;
      state.isDeleted = false;
      state.isUpdated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create New Review
      .addCase(createNewReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewReview.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createNewReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Reviews
      .addCase(getAllReviews.pending, (state) => {
        state.loading = true;
        state.reviews = [];
        state.error = null;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.isDeleted = true;
        state.reviews = state.reviews.filter(
          (review) => review._id !== action.meta.arg.reviewId
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state) => {
        state.loading = false;
        state.isUpdated = true;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
