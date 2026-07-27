import { createSlice, createAsyncThunk, ActionReducerMapBuilder, PayloadAction, AsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import axios from 'axios';

import { ProductImage, Review, Product } from '@/types';

export interface ProductsState {
  products: Product[];
  productsCount: number | null;
  resultPerPage: number | null;
  filteredProductsCount: number | null;
  loading: boolean;
  error: string | null;
}

export interface ProductQueryParams {
  keyword?: string;
  page?: number;
  category?: string;
  'price[gte]'?: number;
  'price[lte]'?: number;
  'ratings[gte]'?: number;
}

const initialState: ProductsState = {
  products: [],
  productsCount: null,
  resultPerPage: null,
  filteredProductsCount: null,
  loading: false,
  error: null,
};

export const getProducts = createAsyncThunk<
  { products: Product[]; productsCount: number; resultPerPage: number; filteredProductsCount: number },
  ProductQueryParams | void,
  { rejectValue: string }
>('products/getProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch products');
    }
    return rejectWithValue('Failed to fetch products');
  }
});

export const getAdminProducts = createAsyncThunk<
  { products: Product[]; productsCount: number; resultPerPage: number; filteredProductsCount: number },
  void,
  { rejectValue: string }
>('products/getAdminProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/products');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch admin products');
    }
    return rejectWithValue('Failed to fetch admin products');
  }
});

// Use GenericAsyncThunk to properly type the dynamic builder
type GenericAsyncThunk = AsyncThunk<any, any, any>;

const handleAsyncThunk = (builder: ActionReducerMapBuilder<ProductsState>, thunk: GenericAsyncThunk) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
    })
    .addCase(thunk.fulfilled, (state, action: PayloadAction<{ products: Product[]; productsCount?: number; resultPerPage?: number; filteredProductsCount?: number }>) => {
      state.loading = false;
      state.products = action.payload.products;
      if (action.payload.productsCount !== undefined) state.productsCount = action.payload.productsCount;
      if (action.payload.resultPerPage !== undefined) state.resultPerPage = action.payload.resultPerPage;
      if (action.payload.filteredProductsCount !== undefined) state.filteredProductsCount = action.payload.filteredProductsCount;
    })
    .addCase(thunk.rejected, (state, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = (action.payload as string) || 'An error occurred';
    });
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    handleAsyncThunk(builder, getProducts);
    handleAsyncThunk(builder, getAdminProducts);
  },
});

export const { clearErrors } = productsSlice.actions;
export default productsSlice.reducer;
