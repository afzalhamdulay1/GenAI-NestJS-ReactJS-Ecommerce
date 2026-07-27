import { StrictMode } from 'react';
import React from 'react';
// import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import store from '@/app/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import '@/index.css';
import App from '@/App';
const Home = React.lazy(() => import('@/components/Home/Home'));
const ProductDetails = React.lazy(() => import('@/components/Product/ProductDetails'));
const Products = React.lazy(() => import('@/components/Product/Products'));
const Search = React.lazy(() => import('@/components/Product/Search'));
const LoginSignup = React.lazy(() => import('@/components/User/LoginSignup'));
import UserOptions from '@/components/Layout/Header/UserOptions';
import ProtectedRoute from '@/components/Route/ProtectedRoute';
const Account = React.lazy(() => import('@/components/User/Profile'));
const Profile = React.lazy(() => import('@/components/User/Profile'));
const UpdateProfile = React.lazy(() => import('@/components/User/UpdateProfile'));
const UpdatePassword = React.lazy(() => import('@/components/User/UpdatePassword'));
const ForgotPassword = React.lazy(() => import('@/components/User/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/components/User/ResetPassword'));
const Cart = React.lazy(() => import('@/components/Cart/Cart'));
const Shipping = React.lazy(() => import('@/components/Cart/Shipping'));
const ConfirmOrder = React.lazy(() => import('@/components/Cart/ConfirmOrder'));
const Payment = React.lazy(() => import('@/components/Cart/Payment'));
const OrderSuccess = React.lazy(() => import('@/components/Cart/OrderSuccess'));
const MyOrders = React.lazy(() => import('@/components/Order/MyOrders'));
const OrderDetails = React.lazy(() => import('@/components/Order/OrderDetails'));
const Dashboard = React.lazy(() => import('@/components/Admin/Dashboard'));
const ProductsList = React.lazy(() => import('@/components/Admin/ProductsList'));
const NewProduct = React.lazy(() => import('@/components/Admin/NewProduct'));
const UpdateProduct = React.lazy(() => import('@/components/Admin/UpdateProduct'));
const OrdersList = React.lazy(() => import('@/components/Admin/OrdersList'));
const ProcessOrder = React.lazy(() => import('@/components/Admin/ProcessOrder'));
const UsersList = React.lazy(() => import('@/components/Admin/UsersList'));
const UpdateUser = React.lazy(() => import('@/components/Admin/UpdateUser'));
const ProductReviews = React.lazy(() => import('@/components/Admin/ProductReviews'));
const NotFound = React.lazy(() => import('@/components/Layout/NotFound/NotFound'));
import ErrorBoundary from '@/components/Layout/ErrorBoundary/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/*',
        element: <NotFound />,
      },
      {
        path: '/login',
        element: (
          <ProtectedRoute authentication={false}>
            <LoginSignup />
          </ProtectedRoute>
        ),
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/products',
        element: <Products />,
      },
      {
        path: '/products/:keyword',
        element: <Products />,
      },
      {
        path: '/product/:id',
        element: <ProductDetails />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
      {
        path: '/shipping',
        element: (
          <ProtectedRoute>
            <Shipping />
          </ProtectedRoute>
        ),
      },
      {
        path: '/order/confirm',
        element: (
          <ProtectedRoute>
            <ConfirmOrder />
          </ProtectedRoute>
        ),
      },
      {
        path: '/process/payment',
        element: (
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        ),
      },
      {
        path: '/success',
        element: (
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: '/order/:id',
        element: (
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account',
        element: (
          <ProtectedRoute key="account">
            <Account />
          </ProtectedRoute>
        ),
      },
      {
        path: '/me/update',
        element: (
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/password/update',
        element: (
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: '/password/forgot',
        element: <ForgotPassword />,
      },
      {
        path: '/password/reset/:token',
        element: <ResetPassword />,
      },
      {
        path: '/admin',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute admin={true}>
                <Dashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'products',
            element: (
              <ProtectedRoute admin={true}>
                <ProductsList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'product',
            element: (
              <ProtectedRoute admin={true}>
                <NewProduct />
              </ProtectedRoute>
            ),
          },
          {
            path: 'product/:id',
            element: (
              <ProtectedRoute admin={true}>
                <UpdateProduct />
              </ProtectedRoute>
            ),
          },
          {
            path: 'orders',
            element: (
              <ProtectedRoute admin={true}>
                <OrdersList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'order/:id',
            element: (
              <ProtectedRoute admin={true}>
                <ProcessOrder />
              </ProtectedRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <ProtectedRoute admin={true}>
                <UsersList />
              </ProtectedRoute>
            ),
          },
          {
            path: 'user/:id',
            element: (
              <ProtectedRoute admin={true}>
                <UpdateUser />
              </ProtectedRoute>
            ),
          },
          {
            path: 'reviews',
            element: (
              <ProtectedRoute admin={true}>
                <ProductReviews />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);

import { setupInterceptors } from '@/services/api';

// Initialize Axios interceptors with the Redux store
setupInterceptors(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
    <ToastContainer position="bottom-center" pauseOnFocusLoss={false} />
  </Provider>,
);
