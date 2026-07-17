import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Thunk to fetch product details
export const fetchProductDetails = createAsyncThunk(
  'product/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error); // Log the error details
      return rejectWithValue(error.response?.data?.message || error.message); // Send detailed error message
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {  'Content-Type': 'multipart/form-data', },
      };

      const { data } = await api.post('/admin/product/new', productData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Update Product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, myForm }, { rejectWithValue }) => {
    try {
      const config = { headers: {  'Content-Type': 'multipart/form-data', }, };
      const { data } = await api.put(`/admin/product/${id}`, myForm, config);
      console.log(data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/product/${id}`);
      console.log(data); 
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Slice for product
const productSlice = createSlice({
  name: 'product',
  initialState: {
    product: {},
    loading: false,
    error: null,
    message: null,
    isDeleted: false,
    reviewSuccess: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetReviewSuccess: (state) => {
      state.reviewSuccess = false;
    },
    resetProductState: (state) => {
      state.product = {}
      state.success = false;
      state.message = null;
      state.isDeleted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        if (!state.error) {
          state.loading = true;
        }
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.product;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload.product;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.product = action.payload.product;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null
        state.success = action.payload.success;
        state.message = action.payload.message;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetReviewSuccess, resetProductState } = productSlice.actions;
export default productSlice.reducer;
