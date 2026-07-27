import axios from 'axios';

const api = axios.create({
  baseURL: `/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

import type { EnhancedStore } from '@reduxjs/toolkit';

import type { RootState } from '@/app/store';

export const setupInterceptors = (store: EnhancedStore<RootState>) => {
  api.interceptors.response.use(
    (response) => {
      // If a request succeeds, ensure we are back online
      if (store.getState().system.isOffline) {
        store.dispatch({ type: 'system/setOffline', payload: false });
      }
      return response;
    },
    (error) => {
      const isNetworkError =
        error.code === 'ERR_NETWORK' || error.message === 'Network Error';
      const isGatewayError =
        error.response &&
        (error.response.status === 502 || error.response.status === 504);

      // Vite proxy returns a 500 HTML/text string when ECONNREFUSED occurs.
      // NestJS APIs always return JSON objects.
      const isViteProxyError =
        error.response &&
        error.response.status === 500 &&
        typeof error.response.data === 'string';

      if (isNetworkError || isGatewayError || isViteProxyError) {
        store.dispatch({ type: 'system/setOffline', payload: true });
      }
      return Promise.reject(error);
    },
  );
};

export { api };
