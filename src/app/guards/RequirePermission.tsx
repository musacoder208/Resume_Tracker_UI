import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectPermissions } from '@/features/auth/redux/auth.selectors';

type Props = {
  permissions: string[];
  children: ReactNode;
};

export function RequirePermission({ permissions, children }: Props): ReactNode {
  const userPermissions = useAppSelector(selectPermissions);

  const hasPermission = permissions.every((p) => userPermissions.includes(p));

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
