import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../types/auth.types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  sessionExpiresAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthContext(
      state,
      action: PayloadAction<{ user: User; sessionExpiresAt?: string | null }>
    ) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.sessionExpiresAt = action.payload.sessionExpiresAt ?? null;
    },

    clearAuthContext(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;
    },
  },
});

export const { setAuthContext, clearAuthContext } = authSlice.actions;
export const authReducer = authSlice.reducer;
