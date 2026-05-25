import { Outlet } from 'react-router-dom';
import { NavBar } from '../../navbar';
import { Breadcrumbs } from '../../breadcrumbs';
import type { JSX } from 'react';

export function SharedLayout(): JSX.Element {
  return (
    <div className="flex h-screen flex-col bg-surface font-base text-base text-text">
      <NavBar />
      <main className="flex flex-1 flex-col overflow-hidden pt-16">
        <div className="flex-shrink-0 px-6">
          <Breadcrumbs />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden px-6 pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
