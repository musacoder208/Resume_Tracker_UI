import type { JSX } from 'react';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { selectUser } from '@/features/auth/redux/auth.selectors';
import { useLogoutMutation } from '@/features/auth/api/auth.api';
import { clearAuthContext } from '@/features/auth/redux/auth.slice';
import { clearActiveSession } from '@/utils/authSession';
import { applyTheme } from '@/theme/applyTheme';
import type { ThemeName } from '@/theme/theme.types';
import { getStoredTheme, setStoredTheme, clearStoredTheme } from '@/utils/themeStorage';
import { useT } from '@/i18n/useT';
import { i18n } from '@/i18n';
import { STORAGE_KEYS } from '@/constants';
import { changeLanguage } from '@/i18n/language';
import { CascadeSelect } from '@/components/ui/cascadeSelect';
import type { CascadeSelectItem } from '@/components/ui/cascadeSelect';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Cog6ToothIcon, GlobeAltIcon, SwatchIcon, ArrowRightOnRectangleIcon } from '@/icons';

type Language = { code: string; label: string };

const LANGUAGES: Language[] = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'ar', label: 'العربية' },
];

type ThemeOption = { value: ThemeName; label: string; dot: string };

// Primary color for each theme — used as the dot indicator in the cascade
const THEME_OPTIONS: ThemeOption[] = [
  { value: 'eqas', label: 'EQAS (Default)', dot: '#00A457' },
  { value: 'light', label: 'Light', dot: '#2563eb' },
  { value: 'dark', label: 'Dark', dot: '#6366f1' },
  { value: 'blue', label: 'Blue', dot: '#0284c7' },
  { value: 'green', label: 'Green', dot: '#16a34a' },
];

export function AvatarMenu(): JSX.Element {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useT('common');
  const [logout, { isLoading }] = useLogoutMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [currentLang, setCurrentLang] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.language) ?? i18n.language ?? 'en-US'
  );
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(getStoredTheme);

  // ── Close when user clicks outside the menu ──
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleLogout = async (): Promise<void> => {
    setIsOpen(false);
    setShowLogoutModal(false);
    try {
      await logout().unwrap();
    } finally {
      clearActiveSession();
      dispatch(clearAuthContext());
      clearStoredTheme();
      applyTheme(getStoredTheme());
      await navigate('/login', { replace: true });
    }
  };

  const handleSignOutClick = (): void => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const handleLangChange = (code: string): void => {
    localStorage.setItem(STORAGE_KEYS.language, code);
    setCurrentLang(code);
    void changeLanguage(code);
    setIsOpen(false);
  };

  const handleThemeChange = (value: ThemeName): void => {
    setStoredTheme(value);
    setCurrentTheme(value);
    applyTheme(value);
    setIsOpen(false);
  };

  const menuItems: CascadeSelectItem[] = [
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: <Cog6ToothIcon className="h-4 w-4" />,
      children: [
        {
          id: 'language',
          label: t('nav.language'),
          icon: <GlobeAltIcon className="h-4 w-4" />,
          children: LANGUAGES.map((lang) => ({
            id: lang.code,
            label: lang.label,
            active: currentLang === lang.code,
            onClick: () => handleLangChange(lang.code),
          })),
        },
        {
          id: 'theme',
          label: t('nav.theme'),
          icon: <SwatchIcon className="h-4 w-4" />,
          children: THEME_OPTIONS.map((opt) => ({
            id: opt.value,
            label: opt.label,
            dot: opt.dot,
            active: currentTheme === opt.value,
            onClick: () => handleThemeChange(opt.value),
          })),
        },
      ],
    },
    {
      id: 'sign-out',
      label: t('nav.signOut'),
      icon: <ArrowRightOnRectangleIcon className="h-4 w-4" />,
      variant: 'danger',
      onClick: handleSignOutClick,
    },
  ];

  const initials = user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={isLoading}
        aria-label={user?.name ?? 'User menu'}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {/* overflow-hidden omitted — it would clip absolutely-positioned sub-panels */}
      {isOpen && (
        <div className="absolute end-0 top-full z-50 mt-2 w-56 rounded-md border border-border bg-surface shadow-lg menu-modal">
          {/* User info header — rounded-t-md clips the top corners (no overflow-hidden on parent) */}
          <div className="rounded-t-md border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-text">{user?.name ?? '—'}</p>
            <p className="truncate text-xs text-text-muted capitalize">{(user?.role ?? '').replace(/_/g, ' ')}</p>
          </div>

          {/* Cascade menu — side panels open LEFT (end) because avatar is at the right edge.
               Remounts fresh each open cycle (conditional render resets hover state). */}
          <CascadeSelect items={menuItems} panelOnly subPanelSide="end" />
        </div>
      )}
      {/* Logout confirm modal — unsaved enrolment data */}
      <ConfirmModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => { void handleLogout(); }}
        icon={<ArrowRightOnRectangleIcon className="h-6 w-6 text-error" />}
        title={t('nav.logoutConfirm.title')}
        message={t('nav.logoutConfirm.message')}
        question={t('nav.logoutConfirm.question')}
        cancelLabel={t('nav.logoutConfirm.cancel')}
        confirmLabel={t('nav.logoutConfirm.confirm')}
        confirmVariant="danger"
      />
    </div>
  );
}
