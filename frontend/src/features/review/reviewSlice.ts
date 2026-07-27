import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { Review } from '@/types';
import axios from 'axios';

export interface ReviewState {
  loading: boolean;
  success: boolean;
  error: string | null;
  reviews: Review[];
  isDeleted: boolean;
  isUpdated: boolean;
}

const initialState: ReviewState = {
  loading: false,
  success: false,
  error: null,
  reviews: [],
  isDeleted: false,
  isUpdated: false,
};

export const createNewReview = createAsyncThunk<
  boolean,
  { rating: number; comment: string; productId: string },
  { rejectValue: string }
>(
  'reviews/createNewReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put('/review', reviewData, config);
      return data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to create review');
      }
      return rejectWithValue('Failed to create review');
    }
  }
);

export const getAllReviews = createAsyncThunk<
  Review[],
  string,
  { rejectValue: string }
>(
  'reviews/getAllReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/reviews?id=${productId}`);
      return data.reviews;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch reviews');
      }
      return rejectWithValue('Failed to fetch reviews');
    }
  }
);

export const deleteReview = createAsyncThunk<
  boolean,
  { reviewId: string; productId: string },
  { rejectValue: string }
>(
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
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to delete review');
      }
      return rejectWithValue('Failed to delete review');
    }
  }
);

export const updateReview = createAsyncThunk<
  boolean,
  { reviewId: string; reviewData: { rating?: number; comment?: string } },
  { rejectValue: string }
>(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put(`/review/${reviewId}`, reviewData, config);
      return data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to update review');
      }
      return rejectWithValue('Failed to update review');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
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
        state.error = action.payload || 'Failed to create review';
      })

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
        state.error = action.payload || 'Failed to fetch reviews';
      })

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
        state.error = action.payload || 'Failed to delete review';
      })

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
        state.error = action.payload || 'Failed to update review';
      });
  },
});

export const { clearErrors, resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
