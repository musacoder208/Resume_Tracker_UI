// Route guard for pages that only unauthenticated users should access.
// If the user is already logged in, redirect them to the given `redirectTo` path.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectIsAuthenticated } from '@/features/auth/redux/auth.selectors';

type Props = {
  children: ReactNode;
  /** Where to redirect authenticated users. Defaults to '/enrollment/new-scheme' */
  redirectTo?: string;
};

export function PublicOnlyRoute({ children, redirectTo = '/enrollment/new-scheme' }: Props): ReactNode {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
