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
  cartItems: JSON.parse(localStorage.getItem("cartItems") || "[]"),
  shippingInfo: JSON.parse(localStorage.getItem("shippingInfo") || "{}"),
  totalAmount: 0,
};

const isSameCartItem = (
  item1: CartItem,
  target: { productId: string; selectedVariant?: Record<string, string> }
) => {
  if (item1.productId !== target.productId) return false;

  const v1 = item1.selectedVariant || {};
  const v2 = target.selectedVariant || {};

  const keys1 = Object.keys(v1);
  const keys2 = Object.keys(v2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => v1[key] === v2[key]);
};

export const addItemsToCart = createAsyncThunk(
  "cart/addItemsToCart",
  async (
    {
      id,
      quantity,
      selectedVariant,
      price,
      stock,
    }: {
      id: string;
      quantity: number;
      selectedVariant?: Record<string, string>;
      price?: number;
      stock?: number;
    },
    { getState, dispatch }
  ) => {
    const { data } = await api.get(`/product/${id}`);
    const product = data.product;
    const finalPrice = price !== undefined ? price : product.price;
    const finalStock = stock !== undefined ? stock : product.stock;

    const item: CartItem = {
      productId: product._id,
      name: product.name,
      price: finalPrice,
      image: product.images[0]?.url || '',
      stock: finalStock,
      quantity,
      selectedVariant,
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
      const existingItem = state.cartItems.find((item) =>
        isSameCartItem(item, action.payload)
      );

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
    changeItemQuantityInCart(
      state,
      action: PayloadAction<{ productId: string; quantity: number; selectedVariant?: Record<string, string> }>
    ) {
      const item = state.cartItems.find((cartItem) =>
        isSameCartItem(cartItem, action.payload)
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeItem(
      state,
      action: PayloadAction<{ productId: string; selectedVariant?: Record<string, string> }>
    ) {
      state.cartItems = state.cartItems.filter(
        (cartItem) => !isSameCartItem(cartItem, action.payload)
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
