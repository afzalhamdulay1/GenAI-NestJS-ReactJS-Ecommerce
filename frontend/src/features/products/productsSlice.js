import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Async thunk to fetch products
export const getProducts = createAsyncThunk('products/getProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params });
    console.log('params:', params);
    console.log('Products fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);  // Log error
    return rejectWithValue(error.response.data.message);
  }
});

export const getAdminProducts = createAsyncThunk('products/getAdminProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);  // Log error
    return rejectWithValue(error.response.data.message);
  }
});

const handleAsyncThunk = (builder, thunk) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.products;
      state.productsCount = action.payload.productsCount;
      state.resultPerPage = action.payload.resultPerPage;
      state.filteredProductsCount = action.payload.filteredProductsCount;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
};


// Slice for products
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    productsCount: null,
    resultPerPage: null,
    filteredProductsCount: null,
    loading: false,
    error: null
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;  // Clear error
    },
  },
  extraReducers: (builder) => {
    handleAsyncThunk(builder, getProducts); // Reuse the utility function
    handleAsyncThunk(builder, getAdminProducts); // Reuse the utility function
  },
});

export const { clearErrors } = productsSlice.actions;
export default productsSlice.reducer;
