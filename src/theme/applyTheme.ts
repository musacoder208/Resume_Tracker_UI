import type { ThemeColors, TenantTheme } from './theme.types';
import { THEMES } from './theme.utils';
import type { ThemeName } from './theme.types';

function setColorVars(root: HTMLElement, colors: ThemeColors): void {
  (Object.entries(colors) as Array<[keyof ThemeColors, string]>).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`;
    root.style.setProperty(cssVarName, value);
  });
}

export function applyTheme(theme: ThemeName): void {
  const root = document.documentElement;
  const t: TenantTheme = THEMES[theme];

  /* Colors */
  setColorVars(root, t.colors);

  /* Gradient accent pair */
  root.style.setProperty('--accent', t.colors.accent);
  root.style.setProperty('--accent2', t.colors.accent2);

  /* Typography */
  root.style.setProperty('--font-family-primary', t.font.familyPrimary);
  root.style.setProperty('--font-family-mono', t.font.familyMono);
  root.style.setProperty('--font-size-base', t.font.sizeBase);
  root.style.setProperty('--font-weight-light', t.font.weightLight);
  root.style.setProperty('--font-weight-normal', t.font.weightNormal);
  root.style.setProperty('--font-weight-medium', t.font.weightMedium);
  root.style.setProperty('--font-weight-semibold', t.font.weightSemibold);
  root.style.setProperty('--font-weight-bold', t.font.weightBold);
  root.style.setProperty('--font-weight-extra-bold', t.font.weightExtraBold);

  /* Radius */
  root.style.setProperty('--radius-none', t.radius.none);
  root.style.setProperty('--radius-sm', t.radius.sm);
  root.style.setProperty('--radius-md', t.radius.md);
  root.style.setProperty('--radius-lg', t.radius.lg);
  root.style.setProperty('--radius-xl', t.radius.xl);
  root.style.setProperty('--radius-full', t.radius.full);

  /* Border Width */
  root.style.setProperty('--border-width-none', t.borderWidth.none);
  root.style.setProperty('--border-width-sm', t.borderWidth.sm);
  root.style.setProperty('--border-width-md', t.borderWidth.md);
  root.style.setProperty('--border-width-lg', t.borderWidth.lg);

  /* Shadows */
  root.style.setProperty('--shadow-sm', t.shadow.sm);
  root.style.setProperty('--shadow-md', t.shadow.md);
  root.style.setProperty('--shadow-lg', t.shadow.lg);

  root.setAttribute('data-theme', theme);
}
