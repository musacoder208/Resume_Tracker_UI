//	Route guard. Reads selectIsAuthenticated from Redux. If false → redirects to /login. Wraps all protected routes.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectIsAuthenticated } from '@/features/auth/redux/auth.selectors';

type Props = {
  children: ReactNode;
};

export function RequireAuth({ children }: Props): ReactNode {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
