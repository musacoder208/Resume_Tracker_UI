import { useState, type ReactNode, type JSX } from 'react';
import type { GlobalSearchContextValue } from './useGlobalSearchContext';
import { GlobalSearchContext } from './useGlobalSearchContext';

export function GlobalSearchProvider({ children }: { children: ReactNode }): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');

  const value: GlobalSearchContextValue = { searchTerm, setSearchTerm };

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
}
