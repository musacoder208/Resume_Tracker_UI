import { createBrowserRouter } from 'react-router-dom';
import { AppInitialization } from '../middleware/AppInitialization';
import { RequireAuth } from '../guards/RequireAuth';
import { AppShell } from '../layout/pageLayout/privateLayout/AppShell';
import { NotFound } from '@/components/ui/notFound';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { CompanyProfilePage } from '@/features/companyProfile/pages/CompanyProfilePage';
import { JdLandingPage } from '@/features/jd/pages/JdLandingPage';
import { AddJdPage } from '@/features/jd/pages/AddJdPage';
import { CandidateSearchPage } from '@/features/candidate/pages/CandidateSearchPage';
import { AddCandidatePage } from '@/features/candidate/pages/AddCandidatePage';
import { CandidateDetailsPage } from '@/features/candidate/pages/CandidateDetailsPage';
//import { env } from '@/config/env';

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
          path: '/jd',
          element: <JdLandingPage />,
        },
        {
          path: '/jd/create',
          element: <AddJdPage />,
        },
        {
          path: '/jd/create/:jdId',
          element: <AddJdPage />,
        },
        {
          path: '/candidate',
          element: <CandidateSearchPage />,
        },
        {
          path: '/candidate/upload',
          element: <AddCandidatePage />,
        },
        {
          path: '/candidate/:candidateId',
          element: <CandidateDetailsPage />,
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
    basename: '/resumetracker',
  }
);
