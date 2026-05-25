import { useAppSelector } from './reduxHooks';
import type { User } from '@/features/auth/types/auth.types';
import type { RootState } from '@/app/store/store';

const selectAuthUser = (state: RootState): User | null => state.auth.user;

export function useCurrentUser(): User | null {
  return useAppSelector(selectAuthUser);
}
