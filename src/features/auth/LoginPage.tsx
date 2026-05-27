import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from './loginForm';
import { selectIsAuthenticated } from './redux/auth.selectors';
import { useAppSelector } from '@/hooks/reduxHooks';

export function LoginPage(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary-subtle px-4 py-10">
      <LoginForm />
    </div>
  );
}
