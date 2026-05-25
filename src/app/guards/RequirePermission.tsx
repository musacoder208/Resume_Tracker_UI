//Route guard. Takes a permissions prop (string array). Checks user's permissions from Redux.
//If missing any → redirects to /unauthorized. Used per-route for fine-grained access control.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectUser } from '@/features/auth/redux/auth.selectors';

type Props = {
  permissions: string[];
  children: ReactNode;
};

export function RequirePermission({ permissions, children }: Props): ReactNode {
  const user = useAppSelector(selectUser);
  const userPermissions = user?.permissions ?? [];

  const hasPermission = permissions.every((p) => userPermissions.includes(p));

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
