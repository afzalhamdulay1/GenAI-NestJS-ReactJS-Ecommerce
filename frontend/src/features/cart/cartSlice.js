import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from '../../services/api';
import { toast } from "react-toastify";

export const addItemsToCart = createAsyncThunk(
  "cart/addItemsToCart",
  async ({ id, quantity }, { getState, dispatch }) => {
    const { data } = await api.get(`/product/${id}`);
    const item = {
      productId: data.product._id,
      name: data.product.name,
      price: data.product.price,
      image: data.product.images[0].url,
      stock: data.product.Stock,
      quantity,
    };


    dispatch(addItem(item));
    localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
  }
);

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    shippingInfo: {},
  },
  reducers: {
    addItem(state, action) {
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
      state.totalAmount += action.payload.price * action.payload.quantity;
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      console.log(`Add to card item: ${JSON.stringify(action.payload)}`);

    },
    changeItemQuantityInCart(state, action) {
      const item = state.cartItems.find(item => item.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
        // state.totalAmount += item.price;
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeItem(state, action) {
      state.cartItems = state.cartItems.filter(
        (cartItem) => cartItem.productId !== action.payload.productId
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    saveShippingInfo(state, action) {
      state.shippingInfo = action.payload;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
  },
});

export const { removeItem, saveShippingInfo, addItem, changeItemQuantityInCart } = cartSlice.actions;

export default cartSlice.reducer;

