import type { RootState } from '@/app/store/store';
import type { AuthState, User, PageAccess } from '../types/auth.types';

export const selectAuth = (state: RootState): AuthState => state.auth;

export const selectUser = (state: RootState): User | null => state.auth.user;

export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;

export const selectSessionExpiresAt = (state: RootState): string | null =>
  state.auth.sessionExpiresAt;

export const selectPermissions = (state: RootState): string[] => state.auth.permissions;

export const selectPageAccess = (state: RootState): PageAccess[] => state.auth.pageAccess;
