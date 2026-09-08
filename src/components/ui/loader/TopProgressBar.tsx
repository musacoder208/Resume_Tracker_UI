import { useState, useEffect, type JSX } from 'react';
import { useSelector } from 'react-redux';

// updateCandidateScore already shows its own inline "Processing..." state on
// the button that triggers it, so it's excluded here to avoid a redundant
// global bar (affects both Start Scoring and Calculate Score, since both
// call this same mutation).
const EXCLUDED_ENDPOINTS = new Set(['updateCandidateScore']);

function useIsApiLoading(): boolean {
  return useSelector((state: unknown) => {
    const api = (state as Record<string, unknown>).api as
      | Record<string, Record<string, { status?: string; endpointName?: string }>>
      | undefined;
    if (api == null) return false;
    const queries = Object.values(api.queries ?? {});
    const mutations = Object.values(api.mutations ?? {});
    return (
      queries.some((q) => q?.status === 'pending') ||
      mutations.some((m) => m?.status === 'pending' && !EXCLUDED_ENDPOINTS.has(m?.endpointName ?? ''))
    );
  });
}

export function TopProgressBar(): JSX.Element | null {
  const isLoading = useIsApiLoading();

  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setCompleting(false);
      setWidth(0);
      const id = setTimeout(() => { setWidth(80); }, 16);
      return () => { clearTimeout(id); };
    } else if (visible) {
      setCompleting(true);
      setWidth(100);
      const id = setTimeout(() => {
        setVisible(false);
        setWidth(0);
        setCompleting(false);
      }, 400);
      return () => { clearTimeout(id); };
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[9999] h-[3px] bg-primary"
      style={{
        width: `${width}%`,
        transition: completing
          ? 'width 200ms ease-out'
          : 'width 1800ms ease-out',
        boxShadow: '0 0 8px 2px color-mix(in srgb, var(--color-primary, #6366f1) 50%, transparent)',
      }}
    />
  );
}
