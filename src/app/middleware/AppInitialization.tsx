import { useEffect, useRef, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setAuthContext } from '@/features/auth/redux/auth.slice';
import { useGetSessionQuery } from '@/features/auth/api/auth.api';
import { initializeApp } from '../initializeApp';
import { useToast } from '@/hooks/useToast';
import { registerToast } from '@/components/ui/toast/toastService';
import { ModalHost } from '@/components/modals/ModalHost';
import { applyTheme } from '@/theme/applyTheme';
import { getStoredTheme } from '@/utils/themeStorage';
import { isActiveSession, clearActiveSession } from '@/utils/authSession';
import { ScreenLoader } from '@/components/ui/screenLoader';

type Props = {
  children: ReactNode;
};

export function AppInitialization({ children }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const toast = useToast();
  const { data: sessionData, isLoading, isError } = useGetSessionQuery(undefined, {
    skip: !isActiveSession(),
  });
  const hasInitialized = useRef(false);

  useEffect(() => {
    registerToast(toast);
  }, [toast]);

  useEffect(() => {
    if (sessionData != null) {
      dispatch(setAuthContext(sessionData));
    }
  }, [sessionData, dispatch]);

  useEffect(() => {
    if (isLoading || hasInitialized.current) return;
    hasInitialized.current = true;

    if (isError) {
      clearActiveSession();
    }

    applyTheme(getStoredTheme());

    void (async () => {
      try {
        await initializeApp();
      } catch (error) {
        console.error('App initialization failed', error);
      } finally {
        setReady(true);
      }
    })();
  }, [isLoading, sessionData, isError, dispatch]);

  if (!ready) {
    return <ScreenLoader />;
  }

  return (
    <>
      {children}
      <ModalHost />
    </>
  );
}
