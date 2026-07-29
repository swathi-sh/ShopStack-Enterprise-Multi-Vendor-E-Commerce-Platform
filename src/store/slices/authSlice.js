// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial session data from localStorage if available
const initialToken = localStorage.getItem('shopstack_token');
const initialUser = localStorage.getItem('shopstack_user')
  ? JSON.parse(localStorage.getItem('shopstack_user'))
  : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      
      // Persist to localStorage
      localStorage.setItem('shopstack_token', action.payload.token);
      localStorage.setItem('shopstack_user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage session
      localStorage.removeItem('shopstack_token');
      localStorage.removeItem('shopstack_user');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;