import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { ShippingInfo } from '../cart/cartSlice';

export interface PaymentInfo {
  id: string;
  status: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: string;
  productId?: string;
}

export interface Order {
  _id: string;
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  paymentInfo: PaymentInfo;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  deliveredAt?: string;
  createdAt: string;
  user: any;
}

export interface OrderState {
  order: Order | null;
  myOrders: Order[];
  orders: Order[];
  orderDetails: Order | null;
  loading: boolean;
  error: string | null;
  isDeleted: boolean;
  isUpdated: boolean;
  success?: boolean;
}

const initialState: OrderState = {
  order: null,
  myOrders: [],
  orders: [],
  orderDetails: null,
  loading: false,
  error: null,
  isDeleted: false,
  isUpdated: false,
  success: false,
};

export const createOrder = createAsyncThunk<
  { order: Order },
  any,
  { rejectValue: string }
>('order/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post('/order/new', orderData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getMyOrders = createAsyncThunk<
  { orders: Order[] },
  void,
  { rejectValue: string }
>('order/myOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders/me');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getOrderDetails = createAsyncThunk<
  { order: Order },
  string,
  { rejectValue: string }
>('order/getOrderDetails', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getAllOrders = createAsyncThunk<
  { orders: Order[] },
  void,
  { rejectValue: string }
>('order/getAllOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/orders');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateOrder = createAsyncThunk<
  { success: boolean },
  { id: string; orderData: any },
  { rejectValue: string }
>('order/updateOrder', async ({ id, orderData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/order/${id}`, orderData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteOrder = createAsyncThunk<
  { success: boolean },
  string,
  { rejectValue: string }
>('order/deleteOrder', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/admin/order/${id}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
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
        state.error = action.payload || 'Order creation failed';
      })

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
        state.error = action.payload || 'Failed to fetch my orders';
      })

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
        state.error = action.payload || 'Failed to fetch order details';
      })

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
        state.error = action.payload || 'Failed to fetch all orders';
      })

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
        state.error = action.payload || 'Failed to update order';
      })

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
        state.error = action.payload || 'Failed to delete order';
      });
  },
});

export const { clearErrors, resetUpdateState, resetDeleteState, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
