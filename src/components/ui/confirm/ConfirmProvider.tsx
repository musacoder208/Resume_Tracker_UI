import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import type { ConfirmFn, ConfirmOptions } from './confirm.types';

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: ConfirmFn;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export interface ConfirmProviderProps {
  children: React.ReactNode;
}

export function ConfirmProvider(props: ConfirmProviderProps): React.ReactElement {
  const { children } = props;

  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [displayOptions, setDisplayOptions] = useState<ConfirmOptions | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Prevent double-resolve if user spams keys/clicks
  const resolvedRef = useRef<boolean>(false);

  const closeAndResolve = useCallback((value: boolean): void => {
    setPending((curr): PendingConfirm | null => {
      if (!curr) return null;
      if (resolvedRef.current) return null;

      resolvedRef.current = true;
      curr.resolve(value);
      return null;
    });
    setLoading(false);
  }, []);

  const onCancel = useCallback((): void => {
    if (loading) return;
    closeAndResolve(false);
  }, [closeAndResolve, loading]);

  // ✅ keep this async
  const onConfirmAsync = useCallback(async (): Promise<void> => {
    if (!pending) return;
    if (loading) return;

    setLoading(true);
    try {
      await pending.options.onConfirm?.();
      closeAndResolve(true);
    } catch {
      setLoading(false);
    }
  }, [pending, loading, closeAndResolve]);

  // ✅ wrapper that returns void (satisfies eslint + JSX expectations)
  const onConfirm = useCallback((): void => {
    void onConfirmAsync(); // explicitly ignore promise
  }, [onConfirmAsync]);

  const confirm = useCallback<ConfirmFn>((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve): void => {
      resolvedRef.current = false;
      setPending({ options, resolve });
      setDisplayOptions(options); // ✅ freeze options for dialog lifetime
    });
  }, []);

  const contextValue: ConfirmContextValue = useMemo(
    (): ConfirmContextValue => ({ confirm }),
    [confirm]
  );

  const handleAfterClose = useCallback((): void => {
    setDisplayOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      {displayOptions !== null && (
        <ConfirmDialog
            open={pending !== null}
            options={displayOptions}
            loading={loading}
            onCancel={onCancel}
            onConfirm={onConfirm}
            onAfterClose={handleAfterClose}
        />
        )}
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }
  return ctx.confirm;
}
