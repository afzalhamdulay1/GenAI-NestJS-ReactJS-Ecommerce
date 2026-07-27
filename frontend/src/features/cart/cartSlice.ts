import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from '@/services/api';
import { toast } from "react-toastify";
import { RootState } from '@/app/store';

import { CartItem, ShippingInfo } from '@/types';

export interface CartState {
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  totalAmount?: number;
}

const initialState: CartState = {
  cartItems: [],
  shippingInfo: {},
  totalAmount: 0,
};

export const addItemsToCart = createAsyncThunk(
  "cart/addItemsToCart",
  async ({ id, quantity }: { id: string; quantity: number }, { getState, dispatch }) => {
    const { data } = await api.get(`/product/${id}`);
    const item: CartItem = {
      productId: data.product._id,
      name: data.product.name,
      price: data.product.price,
      image: data.product.images[0]?.url || '',
      stock: data.product.Stock,
      quantity,
    };

    dispatch(addItem(item));
    const state = getState() as RootState;
    localStorage.setItem("cartItems", JSON.stringify(state.cart.cartItems));
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existingItem = state.cartItems.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        if (existingItem.quantity + action.payload.quantity > existingItem.stock) {
          toast.error("Insufficient stock. Item already in cart.");
          return;
        }
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cartItems.push(action.payload);
      }

      toast.success("Added to cart: " + action.payload.name);
      state.totalAmount = (state.totalAmount || 0) + action.payload.price * action.payload.quantity;
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    changeItemQuantityInCart(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.cartItems.find(item => item.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeItem(state, action: PayloadAction<{ productId: string }>) {
      state.cartItems = state.cartItems.filter(
        (cartItem) => cartItem.productId !== action.payload.productId
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    saveShippingInfo(state, action: PayloadAction<ShippingInfo>) {
      state.shippingInfo = action.payload;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    emptyCart(state) {
      state.cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
  },
});

export const { removeItem, saveShippingInfo, addItem, changeItemQuantityInCart, emptyCart } = cartSlice.actions;

export default cartSlice.reducer;
