import { createContext, useContext } from 'react';

export interface GlobalSearchContextValue {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const GlobalSearchContext = createContext<GlobalSearchContextValue>({
  searchTerm: '',
  setSearchTerm: () => undefined,
});

export function useGlobalSearch(): GlobalSearchContextValue {
  return useContext(GlobalSearchContext);
}
