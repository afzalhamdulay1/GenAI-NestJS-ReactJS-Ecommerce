import { StrictMode } from 'react';
import React from 'react';
// import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import store from './app/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './components/Home/Home';
import ProductDetails from './components/Product/ProductDetails';
import Products from './components/Product/Products';
import Search from './components/Product/Search';
import LoginSignup from './components/User/LoginSignup';
import UserOptions from './components/Layout/Header/UserOptions';
import ProtectedRoute from './components/Route/ProtectedRoute';
import Account from './components/User/Profile';
import Profile from './components/User/Profile';
import UpdateProfile from './components/User/UpdateProfile';
import UpdatePassword from './components/User/UpdatePassword';
import ForgotPassword from './components/User/ForgotPassword';
import ResetPassword from './components/User/ResetPassword';
import Cart from './components/Cart/Cart';
import Shipping from './components/Cart/Shipping';
import ConfirmOrder from './components/Cart/ConfirmOrder';
import Payment from './components/Cart/Payment';
import OrderSuccess from './components/Cart/OrderSuccess';
import MyOrders from './components/Order/MyOrders';
import OrderDetails from './components/Order/OrderDetails';
import Dashboard from './components/Admin/Dashboard';
import ProductsList from './components/Admin/ProductsList';
import NewProduct from './components/Admin/NewProduct';
import UpdateProduct from './components/Admin/UpdateProduct';
import OrdersList from './components/Admin/OrdersList';
import ProcessOrder from './components/Admin/ProcessOrder';
import UsersList from './components/Admin/UsersList';
import UpdateUser from './components/Admin/UpdateUser';
import ProductReviews from './components/Admin/ProductReviews';
import NotFound from './components/Layout/NotFound/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
    <ToastContainer position="bottom-center" pauseOnFocusLoss={false} />
  </Provider>,
);
