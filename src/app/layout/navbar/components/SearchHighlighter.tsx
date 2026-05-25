import { useLocation } from 'react-router-dom';
import { useGlobalSearch } from '@/hooks/useGlobalSearchContext';
import { useHighlightDom } from '@/hooks/useHighlightDom';
import { useEffect, useRef } from 'react';

export function SearchHighlighter(): null {
  const { searchTerm, setSearchTerm } = useGlobalSearch();
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  // Clear search term on route change
  useEffect((): void => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setSearchTerm('');
    }
  }, [pathname, setSearchTerm]);

  useHighlightDom(searchTerm, [pathname]);

  return null;
}
