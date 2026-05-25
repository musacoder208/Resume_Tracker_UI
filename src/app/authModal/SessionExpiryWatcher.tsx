//Silent background component. Reads sessionExpiresAt from auth state, runs a 1-second interval, and shows SessionExpiryModal when the session is about to expire.
// Auto-logs out when it expires.

import { useEffect, useState, type JSX } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useNavigate } from 'react-router-dom';
import { clearAuthContext, useLogoutMutation } from '@/features/auth/redux';
import { selectSessionExpiresAt } from '@/features/auth/redux/auth.selectors';
import { SessionExpiryModal } from './SessionExpiryModal';
import { applyTheme } from '@/theme/applyTheme';
import { DEFAULT_THEME } from '@/theme/theme.types';
import { clearStoredTheme } from '@/utils/themeStorage';
import { clearActiveSession } from '@/utils/authSession';
const WARNING_BEFORE_MIN = 0.3;
const WARNING_BEFORE_MS = WARNING_BEFORE_MIN * 60 * 1000;

export function SessionExpiryWatcher(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const sessionExpiresAt = useAppSelector(selectSessionExpiresAt);

  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (!sessionExpiresAt) return;

    const expiresAt = new Date(sessionExpiresAt).getTime();
    const dismissKey = `session-expiry-warning-dismissed:${sessionExpiresAt}`;

    const handleLogout = async (): Promise<void> => {
      try {
        sessionStorage.removeItem(dismissKey);
        await logout().unwrap();
      } finally {
        clearActiveSession();
        dispatch(clearAuthContext());
        clearStoredTheme();
        applyTheme(DEFAULT_THEME);
        await navigate('/login?reason=session-expired', { replace: true });
      }
    };

    const tick = (): void => {
      const diff = expiresAt - Date.now();
      setRemainingMs(diff);

      const dismissed = sessionStorage.getItem(dismissKey);

      if (diff > 0 && diff <= WARNING_BEFORE_MS && !dismissed) {
        setShow(true);
      }

      if (diff <= 0) {
        void handleLogout();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sessionExpiresAt, logout, dispatch, navigate]);

  if (!show || remainingMs == null) return null;

  const handleContinue = (): void => {
    const dismissKey = `session-expiry-warning-dismissed:${sessionExpiresAt}`;
    sessionStorage.setItem(dismissKey, 'true');
    setShow(false);
  };

  const handleLoginAgain = (): void => {
    clearActiveSession();
    sessionStorage.clear();
    dispatch(clearAuthContext());
    clearStoredTheme();
    applyTheme(DEFAULT_THEME);
    void navigate('/login', { replace: true });
  };

  return (
    <SessionExpiryModal
      remainingMs={remainingMs}
      onContinue={handleContinue}
      onLoginAgain={handleLoginAgain}
    />
  );
}
