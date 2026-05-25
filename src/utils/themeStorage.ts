import type { ThemeName } from '@/theme/theme.types';
import type { AppLanguage } from '@/i18n/i18n.types';

const THEME_KEY = 'app-theme';
const LANG_KEY = 'app-language';

const VALID_THEMES: ThemeName[] = ['eqas', 'light', 'dark', 'blue', 'green'];

export function getStoredTheme(): ThemeName {
  const value = localStorage.getItem(THEME_KEY);
  return VALID_THEMES.includes(value as ThemeName) ? (value as ThemeName) : 'eqas';
}

export function setStoredTheme(theme: ThemeName): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function clearStoredTheme(): void {
  localStorage.removeItem(THEME_KEY);
}

export function getStoredLanguage(): AppLanguage {
  const value = localStorage.getItem(LANG_KEY);
  return value === 'hi' || value === 'en' ? value : 'en';
}

export function setStoredLanguage(lang: AppLanguage): void {
  localStorage.setItem(LANG_KEY, lang);
}
