import { type JSX, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, ChevronDownIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectUser } from '@/features/auth/redux/auth.selectors';
import { useLogoutMutation } from '@/features/auth/api/auth.api';
import { clearAuthContext } from '@/features/auth/redux/auth.slice';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { useNavigate } from 'react-router-dom';
import { LanguageDropdown } from '../language';
import { ThemeDropdown } from '@/theme/ThemeDropdown';
import { MegaMenuPopover } from './menu';
import { applyTheme } from '@/theme/applyTheme';
import { DEFAULT_THEME } from '@/theme/theme.types';
import { clearStoredTheme } from '@/utils/themeStorage';

export function Header(): JSX.Element {
  const { t } = useT('common');
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearAuthContext());
      clearStoredTheme();
      applyTheme(DEFAULT_THEME);
      await navigate('/login', { replace: true });
    }
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50 h-16 border-b border-border bg-surface text-text">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex flex-1 items-center gap-x-6">
          <button type="button" className="-m-3 p-3 md:hidden">
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="size-5 text-text" />
          </button>

          {/* Logo */}
          <img
            alt="LIMSXL"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="h-8 w-auto dark:hidden"
          />
          <img
            alt="LIMSXL"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            className="h-8 w-auto not-dark:hidden"
          />
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex md:gap-x-10 md:text-sm md:font-semibold md:text-text">
          <div className="h-12 px-4 flex items-center justify-between">
            <MegaMenuPopover />
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageDropdown />
          <ThemeDropdown />
        </div>

        {/* Right — user menu */}
        <div className="flex flex-1 items-center justify-end gap-x-4">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-x-2 rounded-full focus:outline-none">
              <img
                alt={user?.name ?? 'User'}
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                className="size-8 rounded-full bg-surface-muted"
              />
              <ChevronDownIcon className="size-4 text-text-muted" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute end-0 z-10 mt-2 w-52 origin-top-right rounded-md bg-surface shadow-lg ring-1 ring-border focus:outline-none">
                {/* User info */}
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-text truncate">{user?.name ?? '—'}</p>
                  <p className="text-xs text-text-muted mt-0.5 capitalize">
                    {user?.role.replace(/_/g, ' ') ?? '—'}
                  </p>
                </div>

                {/* Logout */}
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={isLoading}
                        className={`w-full px-4 py-2 text-start text-sm ${
                          active ? 'bg-surface-hover text-text' : 'text-text-muted'
                        } disabled:opacity-50`}
                      >
                        {t('nav.logout')}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
