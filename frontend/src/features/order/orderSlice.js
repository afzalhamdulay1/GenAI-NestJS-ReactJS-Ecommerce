import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Create Order
export const createOrder = createAsyncThunk('order/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post('/order/new', orderData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || error.message);
  }
});

// My Orders
export const getMyOrders = createAsyncThunk('order/myOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders/me');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || error.message);
  }
});

// Order Details
export const getOrderDetails = createAsyncThunk('order/getOrderDetails', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || error.message);
  }
});

// Get All Orders (Admin)
export const getAllOrders = createAsyncThunk('order/getAllOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/orders');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || error.message);
  }
});

// Update Order (Admin)
export const updateOrder = createAsyncThunk('order/updateOrder', async ({ id, orderData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/order/${id}`, orderData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || error.message);
  }
});

// Delete Order (Admin)
export const deleteOrder = createAsyncThunk('order/deleteOrder', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/admin/order/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || error.message);
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: [],
    myOrders: [],
    orders: [],
    orderDetails: [],
    loading: false,
    error: null,
    isDeleted: false,
    isUpdated: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetUpdateState: (state) => {
      state.isUpdated = false;
    },
    resetDeleteState: (state) => {
      state.isDeleted = false;
    },
    resetOrderState: (state) => {
      state.order = null;
      state.success = false;
      state.isUpdated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // My Orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload.orders;
        state.error = null;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload.order;
        state.error = null;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Orders (Admin)
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.error = null;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Order (Admin)
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload.success;
        state.error = null;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Order (Admin)
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.isDeleted = action.payload.success;
        state.error = null;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetUpdateState, resetDeleteState, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
