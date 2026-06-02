import { createBrowserRouter } from 'react-router-dom';
import { AppInitialization } from '../middleware/AppInitialization';
import { RequireAuth } from '../guards/RequireAuth';
import { AppShell } from '../layout/pageLayout/privateLayout/AppShell';
import { NotFound } from '@/components/ui/notFound';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { CompanyProfilePage } from '@/features/companyProfile/pages/CompanyProfilePage';
import { env } from '@/config/env';

export const router = createBrowserRouter(
  [
    // ── Authenticated routes (inside AppShell) ─────────────────────────────────
    {
      element: (
        <AppInitialization>
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        </AppInitialization>
      ),
      children: [
        {
          path: '/',
          element: <></>,
        },
        {
          path: '/dashboard',
          element: <DashboardPage />,
        },
        {
          path: '/company-profile',
          element: <CompanyProfilePage />,
        },
        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
    // ── Login ──────────────────────────────────────────────────────────────────
    {
      path: '/login',
      element: (
        <AppInitialization>
          <LoginPage />
        </AppInitialization>
      ),
    },
  ],
  {
    basename: env.SERVER_MODE === 'production' ? '/resume-tracker' : '/',
  }
);
