// userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Thunks

// // Login Thunk
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      return rejectWithValue(errorMsg);
    }
  }
);

// Register Thunk
export const registerUser = createAsyncThunk(
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
      const errorMsg = error.response?.data?.message || 'Registration failed';
      return rejectWithValue(errorMsg);
    }
  }
);

// Load User Thunk
export const loadUser = createAsyncThunk(
  'user/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load user';
      return rejectWithValue(errorMsg);
    }
  }
);

// Logout Thunk
export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.get('/logout');
      return;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Logout failed';
      return rejectWithValue(errorMsg);
    }
  }
);

// Update Profile Thunk
export const updateProfile = createAsyncThunk(
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
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      return rejectWithValue(errorMsg);
    }
  }
);


export const updatePassword = createAsyncThunk(
  'user/updatePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      console.log('Sending data:', passwords); // Debug request payload
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put('/password/update', passwords, config);
      console.log('Response data:', data); // Debug response
      return data.success;
    } catch (error) {
      console.error('Error response:', error.response.data); // Debug error
      return rejectWithValue(error.response.data.message);
    }
  }
);



export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
      };
      const { data } = await api.post('/password/forgot', { email }, config);
      return data.message; // Assuming backend responds with a message
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Forgot password failed');
    }
  }
);

// Reset Password Thunk
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ token, resetData }, { rejectWithValue }) => {
    try {
      console.log(resetData);

      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put(`/password/reset/${token}`, resetData, config);
      return data.success; // Assuming backend responds with success flag
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Reset password failed');
    }
  }
);

// Get All Users Thunk
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users');
      return data.users; // Assuming backend responds with an array of users
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch users';
      return rejectWithValue(errorMsg);
    }
  }
);

// Get User Details Thunk
export const getUserDetails = createAsyncThunk(
  'user/getUserDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/user/${id}`);
      console.log(data.user);

      return data.user; // Assuming backend responds with user details
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch user details';
      return rejectWithValue(errorMsg);
    }
  }
);

// Update User Thunk
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await api.put(`/admin/user/${id}`, userData, config);
      return data.success; // Assuming backend responds with success flag
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update user';
      return rejectWithValue(errorMsg);
    }
  }
);

// Delete User Thunk
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/user/${id}`);
      return { success: data.success, userId: id }; // Pass success and userId for state updates
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      return rejectWithValue(errorMsg);
    }
  }
);

// Slice

const userSlice = createSlice({
  name: 'user',
  initialState: {
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
  },
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
      // state.userDetails = null
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.loadUserError = action.payload;
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
        state.error = action.payload;
      })

      // Update Profile Cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload; // Assuming payload is true
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      })

      // Update User Cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isUpdated = action.payload; // Assuming payload is true
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete User Cases
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.isDeleted = true;
        state.users = state.users.filter((user) => user._id !== action.payload.userId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetUpdateProfile, clearMessage, clearSuccess, resetUserState } = userSlice.actions;
export default userSlice.reducer;
