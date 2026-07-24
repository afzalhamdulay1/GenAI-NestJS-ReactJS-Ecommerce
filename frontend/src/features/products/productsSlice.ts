import { createSlice, createAsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export interface ProductImage {
  public_id: string;
  url: string;
}

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  ratings: number;
  images: ProductImage[];
  category: string;
  Stock: number;
  numOfReviews: number;
  reviews?: Review[];
  user?: string;
  createdAt?: string;
}

export interface ProductsState {
  products: Product[];
  productsCount: number | null;
  resultPerPage: number | null;
  filteredProductsCount: number | null;
  loading: boolean;
  error: string | null;
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
  any,
  { rejectValue: string }
>('products/getProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

export const getAdminProducts = createAsyncThunk<
  { products: Product[]; productsCount: number; resultPerPage: number; filteredProductsCount: number },
  any,
  { rejectValue: string }
>('products/getAdminProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/products', { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin products');
  }
});

const handleAsyncThunk = (builder: ActionReducerMapBuilder<ProductsState>, thunk: any) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
    })
    .addCase(thunk.fulfilled, (state, action: any) => {
      state.loading = false;
      state.products = action.payload.products;
      state.productsCount = action.payload.productsCount;
      state.resultPerPage = action.payload.resultPerPage;
      state.filteredProductsCount = action.payload.filteredProductsCount;
    })
    .addCase(thunk.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload || 'An error occurred';
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
