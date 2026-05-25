import { createBrowserRouter } from 'react-router-dom';
import { AppInitialization } from '../middleware/AppInitialization';
import { RequireAuth } from '../guards/RequireAuth';
import { AppShell } from '../layout/pageLayout/privateLayout/AppShell';
import { NotFound } from '@/components/ui/notFound';
import { LoginPage } from '@/features/auth/LoginPage';
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
