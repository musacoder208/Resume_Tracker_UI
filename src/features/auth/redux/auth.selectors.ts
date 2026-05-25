//Memoized selectors: selectIsAuthenticated, selectUser, selectPermissions. Used by guards and components.

import type { RootState } from '@/app/store/store';
import type { AuthState, User } from '../types/auth.types';

export const selectAuth = (state: RootState): AuthState => state.auth;

export const selectUser = (state: RootState): User | null => state.auth.user;

export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;

export const selectSessionExpiresAt = (state: RootState): string | null =>
  state.auth.sessionExpiresAt;

export const selectPermissions = (state: RootState): string[] => {
  const user = selectUser(state);
  return user?.permissions ?? [];
};
