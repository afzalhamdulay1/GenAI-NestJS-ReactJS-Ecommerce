import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '@/features/products/productsSlice';
import userReducer from '@/features/user/userSlice';
import cartReducer from '@/features/cart/cartSlice';
import orderReducer from '@/features/order/orderSlice';
import productReducer from '@/features/products/productSlice';
import newReviewReducer from '@/features/review/reviewSlice';
import systemReducer from '@/features/system/systemSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    order: orderReducer,
    newOrder: orderReducer,
    product: productReducer,
    products: productsReducer,
    user: userReducer,
    reviews: newReviewReducer,
    system: systemReducer,
  },
  preloadedState: {
    cart: {
      cartItems: localStorage.getItem("cartItems")
        ? JSON.parse(localStorage.getItem("cartItems") || "[]")
        : [],
      shippingInfo: localStorage.getItem("shippingInfo")
        ? JSON.parse(localStorage.getItem("shippingInfo") || "{}")
        : {},
    },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
