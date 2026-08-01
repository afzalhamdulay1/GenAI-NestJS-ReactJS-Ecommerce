import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { Product } from '@/types';
import axios from 'axios';

export interface SingleProductState {
  product: Partial<Product>;
  loading: boolean;
  error: string | null;
  message: string | null;
  isDeleted: boolean;
  reviewSuccess: boolean;
  success?: boolean;
}

const initialState: SingleProductState = {
  product: {},
  loading: false,
  error: null,
  message: null,
  isDeleted: false,
  reviewSuccess: false,
  success: false,
};

export const fetchProductDetails = createAsyncThunk<
  { product: Product },
  string,
  { rejectValue: string }
>(
  'product/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || error.message);
      }
      return rejectWithValue('Failed to fetch product details');
    }
  }
);

export const createProduct = createAsyncThunk<
  { success: boolean; product: Product },
  FormData,
  { rejectValue: string }
>(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };
      const { data } = await api.post('/admin/product/new', productData, config);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to create product');
      }
      return rejectWithValue('Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk<
  { success: boolean; product: Product },
  { id: string; myForm: FormData },
  { rejectValue: string }
>(
  "products/updateProduct",
  async ({ id, myForm }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.put(`/admin/product/${id}`, myForm, config);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to update product');
      }
      return rejectWithValue('Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk<
  { success: boolean; message: string },
  string,
  { rejectValue: string }
>(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/product/${id}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to delete product');
      }
      return rejectWithValue('Failed to delete product');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetReviewSuccess: (state) => {
      state.reviewSuccess = false;
    },
    resetProductState: (state) => {
      state.product = {};
      state.success = false;
      state.message = null;
      state.isDeleted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.product;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch details';
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload.product;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Creation failed';
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload.product;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Update failed';
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Deletion failed';
      });
  },
});

export const { clearErrors, resetReviewSuccess, resetProductState } = productSlice.actions;
export default productSlice.reducer;
