import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from '../types/auth.types';
import type { MappedAuthData } from '../api/auth.mappers';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  sessionExpiresAt: null,
  permissions: [],
  pageAccess: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthContext(state, action: PayloadAction<MappedAuthData>) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.sessionExpiresAt = action.payload.sessionExpiresAt;
      state.permissions = action.payload.permissions;
      state.pageAccess = action.payload.pageAccess;
    },

    clearAuthContext(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;
      state.permissions = [];
      state.pageAccess = [];
    },
  },
});

export const { setAuthContext, clearAuthContext } = authSlice.actions;
export const authReducer = authSlice.reducer;
