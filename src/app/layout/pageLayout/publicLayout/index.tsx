import type { ReactNode } from 'react';
import { AppInitialization } from '../../../middleware/AppInitialization';
import { PublicOnlyRoute } from '../../../guards/PublicOnlyRoute';
import { NavBar } from '../../navbar';
import { Breadcrumbs } from '../../breadcrumbs';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <AppInitialization>
      <PublicOnlyRoute>
        <div className="flex h-screen flex-col bg-surface font-base text-base text-text v-publicLayout">
          <NavBar />
          <main className="flex flex-1 flex-col overflow-hidden pt-16">
            <div className="flex-shrink-0 px-6">
              <Breadcrumbs />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden px-6 pb-6 v-publicLayout-child">
              {children}
            </div>
          </main>
        </div>
      </PublicOnlyRoute>
    </AppInitialization>
  );
}
