import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import axios from 'axios';

import { User, UserAvatar } from '@/types';

export interface UserState {
  success: boolean | null;
  user: User | null;
  users: User[];
  userDetails: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isUserLoading: boolean;
  error: string | null;
  loadUserError: string | null;
  isUpdated: boolean;
  isDeleted: boolean;
  message: string | null;
}

const initialState: UserState = {
  success: null,
  user: null,
  users: [],
  userDetails: null,
  isAuthenticated: false,
  loading: false,
  isUserLoading: true,
  error: null,
  loadUserError: null,
  isUpdated: false,
  isDeleted: false,
  message: null,
};

// Thunks

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password?: string },
  { rejectValue: string }
>(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Login failed');
      }
      return rejectWithValue('Login failed');
    }
  }
);

export const registerUser = createAsyncThunk<
  { user: User; token: string },
  FormData,
  { rejectValue: string }
>(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Registration failed');
      }
      return rejectWithValue('Registration failed');
    }
  }
);

export const loadUser = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>(
  'user/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to load user');
      }
      return rejectWithValue('Failed to load user');
    }
  }
);

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.get('/logout');
      return;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Logout failed');
      }
      return rejectWithValue('Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk<
  boolean,
  FormData,
  { rejectValue: string }
>(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await api.put('/me/update', userData, config);
      return data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to update profile');
      }
      return rejectWithValue('Failed to update profile');
    }
  }
);

export const updatePassword = createAsyncThunk<
  boolean,
  { oldPassword?: string; newPassword?: string; confirmPassword?: string },
  { rejectValue: string }
>(
  'user/updatePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put('/password/update', passwords, config);
      return data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Update password failed');
      }
      return rejectWithValue('Update password failed');
    }
  }
);

export const forgotPassword = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'user/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.post('/password/forgot', { email }, config);
      return data.message;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Forgot password failed');
      }
      return rejectWithValue('Forgot password failed');
    }
  }
);

export const resetPassword = createAsyncThunk<
  boolean,
  { token: string; resetData: { password?: string; confirmPassword?: string } },
  { rejectValue: string }
>(
  'user/resetPassword',
  async ({ token, resetData }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put(`/password/reset/${token}`, resetData, config);
      return data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Reset password failed');
      }
      return rejectWithValue('Reset password failed');
    }
  }
);

export const getAllUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>(
  'user/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users');
      return data.users;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch users');
      }
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const getUserDetails = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>(
  'user/getUserDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/user/${id}`);
      return data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to fetch user details');
      }
      return rejectWithValue('Failed to fetch user details');
    }
  }
);

export const updateUser = createAsyncThunk<
  boolean,
  { id: string; userData: { name?: string; email?: string; role?: string } },
  { rejectValue: string }
>(
  'user/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put(`/admin/user/${id}`, userData, config);
      return data.success;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to update user');
      }
      return rejectWithValue('Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk<
  { success: boolean; userId: string },
  string,
  { rejectValue: string }
>(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/user/${id}`);
      return { success: data.success, userId: id };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Failed to delete user');
      }
      return rejectWithValue('Failed to delete user');
    }
  }
);

// Slice

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.loadUserError = null;
    },
    resetUpdateProfile: (state) => {
      state.isUpdated = false;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetUserState: (state) => {
      state.isDeleted = false;
      state.isUpdated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
      })

      // Register Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Registration failed';
      })

      // Load User Cases
      .addCase(loadUser.pending, (state) => {
        state.isUserLoading = true;
        state.loadUserError = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isUserLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loadUserError = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isUserLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.loadUserError = action.payload || 'Failed to load user';
      })

      // Logout Cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
      })

      // Update Profile Cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile';
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Update password failed';
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Forgot password failed';
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.isUpdated = true;
        state.success = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Reset password failed';
      })

      // Get All Users Cases
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      })

      // Get User Details Cases
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user details';
      })

      // Update User Cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update user';
      })

      // Delete User Cases
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.isDeleted = true;
        state.users = state.users.filter((u) => u._id !== action.payload.userId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export const { clearErrors, resetUpdateProfile, clearMessage, clearSuccess, resetUserState } = userSlice.actions;
export default userSlice.reducer;
