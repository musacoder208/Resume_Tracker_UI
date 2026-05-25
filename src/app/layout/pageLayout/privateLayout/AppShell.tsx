import { useState, type JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from '../../navbar';
import { Sidebar } from '../../sidebar';
import { GlobalSearchProvider } from '@/hooks/useGlobalSearch';
import { SearchHighlighter } from '../../navbar/components/SearchHighlighter';

export function AppShell(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <GlobalSearchProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background font-base text-base text-text">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((p) => !p)} />

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* TopBar */}
          <NavBar />

          {/* Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <Outlet />
          </main>
        </div>

        <SearchHighlighter />
      </div>
    </GlobalSearchProvider>
  );
}
