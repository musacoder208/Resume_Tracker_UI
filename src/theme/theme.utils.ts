import type { TenantTheme, ThemeName } from './theme.types';
import { fontFamilies, fontWeights } from './typography';
import { borderRadius, borderWidth } from './borders';

const sharedRadius = {
  none: borderRadius.none.css,
  sm:   borderRadius.sm.css,
  md:   borderRadius.md.css,
  lg:   borderRadius.lg.css,
  xl:   borderRadius.xl.css,
  full: borderRadius.full.css,
};

const sharedBorderWidth = {
  none: borderWidth.none.css,
  sm:   borderWidth.sm.css,
  md:   borderWidth.md.css,
  lg:   borderWidth.lg.css,
};

const poppinsFont = {
  familyPrimary:  fontFamilies.primary,
  familyMono:     fontFamilies.mono,
  sizeBase:       '1rem',
  weightLight:    String(fontWeights.light),
  weightNormal:   String(fontWeights.regular),
  weightMedium:   String(fontWeights.medium),
  weightSemibold: String(fontWeights.semiBold),
  weightBold:     String(fontWeights.bold),
  weightExtraBold:String(fontWeights.extraBold),
};

export const THEMES: Record<ThemeName, TenantTheme> = {
  // ─────────────────────────────────────────────
  // eqas — Default brand theme
  // Primary palette: Indigo (#6366F1)
  // Neutral palette: Indigo-tinted
  // ─────────────────────────────────────────────
  eqas: {
    colors: {
      /* Background */
      background: '#F8F7FF',
      backgroundSubtle: '#F0EEFF',

      /* Surface */
      surface: '#FFFFFF',
      surfaceMuted: '#EEF2FF',
      surfaceHover: '#E0E7FF',
      surfaceElevated: '#FFFFFF',
      surfaceActive: '#C7D2FE',
      surfaceDisabled: '#f1f1f1',

      /* Text */
      text: '#1E1B4B',
      textMuted: '#4C4891',
      textSubtle: '#818CF8',
      textInverted: '#FFFFFF',
      textDisabled: '#9CA3AF',

      /* Border */
      border: '#C7D2FE',
      borderMuted: '#E0E7FF',
      borderFocus: '#6366F1',
      borderDanger: '#F03526',
      borderStrong: '#3730A3',
      borderInfo: '#3B77BC',
      borderInverse: '#1E1B4B',

      /* Primary — Indigo brand */
      primary: '#6366F1',
      primaryHover: '#4F46E5',
      primaryActive: '#4338CA',
      primarySubtle: '#EEF2FF',
      primaryForeground: '#FFFFFF',
      primaryBorder: '#C7D2FE',

      /* Status — Success */
      success: '#00A457',
      successForeground: '#FFFFFF',
      successSubtle: '#EBFAF2',

      /* Status — Warning */
      warning: '#F59200',
      warningForeground: '#1E1B4B',
      warningSubtle: '#FFF7E6',
      warningText: '#92400E',

      /* Status — Error */
      error: '#F03526',
      errorForeground: '#FFFFFF',
      errorSubtle: '#FFF0ED',

      info: '#1A5499',
      infoForeground: '#FFFFFF',
      infoSubtle: '#E8EFF8',
      infoBorder: '#BDD0EC',

      label: '#374151',
      skeletonBg: '#E0E7FF',

      /* Gradient accent pair */
      accent: '#6366F1',
      accent2: '#A855F7',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(99, 102, 241, 0.10)',
      md: '0 4px 6px rgba(99, 102, 241, 0.15)',
      lg: '0 10px 15px rgba(99, 102, 241, 0.20)',
    },
  },

  light: {
    colors: {
      accent: '#2563eb',
      accent2: '#7c3aed',

      background: '#f9fafb',
      backgroundSubtle: '#f1f5f9',

      surface: '#ffffff',
      surfaceMuted: '#e0f2fe',
      surfaceHover: '#f1f5f9',
      surfaceElevated: '#ffffff',
      surfaceActive: '#e5e7eb',
      surfaceDisabled: '#f8fafc',

      text: '#0f172a',
      textMuted: '#475569',
      textSubtle: '#64748b',
      textInverted: '#ffffff',
      textDisabled: '#94a3b8',

      border: '#bae6fd',
      borderMuted: '#e2e8f0',
      borderFocus: '#2563eb',
      borderDanger: '#dc2626',
      borderStrong: '#0f172a',
      borderInfo: '#2563eb',
      borderInverse: '#0f172a',

      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryActive: '#1e40af',
      primarySubtle: '#dbeafe',
      primaryForeground: '#ffffff',
      primaryBorder: '#bfdbfe',

      success: '#16a34a',
      successForeground: '#ffffff',
      successSubtle: '#dcfce7',

      warning: '#f59e0b',
      warningForeground: '#0f172a',
      warningSubtle: '#fef3c7',
      warningText: '#92400e',

      error: '#dc2626',
      errorForeground: '#ffffff',
      errorSubtle: '#fee2e2',

      info: '#2563eb',
      infoForeground: '#ffffff',
      infoSubtle: '#dbeafe',
      infoBorder: '#bfdbfe',

      label: '#374151',
      skeletonBg: '#e5e7eb',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.15)',
    },
  },

  dark: {
    colors: {
      accent: '#6366f1',
      accent2: '#a855f7',

      /* Background */
      background: '#020617',
      backgroundSubtle: '#020617',

      /* Surface */
      surface: '#0f172a',
      surfaceMuted: '#1e293b',
      surfaceHover: '#334155',
      surfaceElevated: '#020617',
      surfaceActive: '#475569',
      surfaceDisabled: '#020617',

      /* Text */
      text: '#f8fafc',
      textMuted: '#94a3b8',
      textSubtle: '#64748b',
      textInverted: '#020617',
      textDisabled: '#ffffff',

      /* Border */
      border: '#334155',
      borderMuted: '#1e293b',
      borderFocus: '#6366f1',
      borderDanger: '#ef4444',
      borderStrong: '#f8fafc',
      borderInfo: '#6366f1',
      borderInverse: '#f8fafc',

      /* Primary */
      primary: '#6366f1',
      primaryHover: '#818cf8',
      primaryActive: '#4f46e5',
      primarySubtle: '#1e1b4b',
      primaryForeground: '#020617',
      primaryBorder: '#312e81',

      /* Status */
      success: '#22c55e',
      successForeground: '#020617',
      successSubtle: '#052e16',

      warning: '#facc15',
      warningForeground: '#020617',
      warningSubtle: '#422006',
      warningText: '#fde68a',

      error: '#ef4444',
      errorForeground: '#020617',
      errorSubtle: '#450a0a',

      info: '#6366f1',
      infoForeground: '#020617',
      infoSubtle: '#1e1b4b',
      infoBorder: '#312e81',

      label: '#94a3b8',
      skeletonBg: '#121b31',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.6)',
      md: '0 4px 6px rgba(0,0,0,0.7)',
      lg: '0 10px 15px rgba(0,0,0,0.8)',
    },
  },

  blue: {
    colors: {
      accent: '#0284c7',
      accent2: '#7c3aed',

      background: '#f0f9ff',
      backgroundSubtle: '#e0f2fe',

      surface: '#ffffff',
      surfaceMuted: '#e0f2fe',
      surfaceHover: '#bae6fd',
      surfaceElevated: '#ffffff',
      surfaceActive: '#7dd3fc',
      surfaceDisabled: '#f0f9ff',

      text: '#0f172a',
      textMuted: '#475569',
      textSubtle: '#64748b',
      textInverted: '#ffffff',
      textDisabled: '#94a3b8',

      border: '#bae6fd',
      borderMuted: '#e0f2fe',
      borderFocus: '#0284c7',
      borderDanger: '#dc2626',
      borderStrong: '#0f172a',
      borderInfo: '#0284c7',
      borderInverse: '#0f172a',

      primary: '#0284c7',
      primaryHover: '#0369a1',
      primaryActive: '#075985',
      primarySubtle: '#bae6fd',
      primaryForeground: '#ffffff',
      primaryBorder: '#7dd3fc',

      success: '#16a34a',
      successForeground: '#ffffff',
      successSubtle: '#dcfce7',

      warning: '#f59e0b',
      warningForeground: '#0f172a',
      warningSubtle: '#fef3c7',
      warningText: '#92400e',

      error: '#dc2626',
      errorForeground: '#ffffff',
      errorSubtle: '#fee2e2',

      info: '#0284c7',
      infoForeground: '#ffffff',
      infoSubtle: '#e0f2fe',
      infoBorder: '#bae6fd',

      label: '#374151',
      skeletonBg: '#e0f2fe',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(2,132,199,0.15)',
      md: '0 4px 6px rgba(2,132,199,0.25)',
      lg: '0 10px 15px rgba(2,132,199,0.35)',
    },
  },

  green: {
    colors: {
      accent: '#16a34a',
      accent2: '#0284c7',

      background: '#f0fdf4',
      backgroundSubtle: '#dcfce7',

      surface: '#ffffff',
      surfaceMuted: '#dcfce7',
      surfaceHover: '#bbf7d0',
      surfaceElevated: '#ffffff',
      surfaceActive: '#86efac',
      surfaceDisabled: '#f0fdf4',

      text: '#052e16',
      textMuted: '#166534',
      textSubtle: '#15803d',
      textInverted: '#ffffff',
      textDisabled: '#86efac',

      border: '#bbf7d0',
      borderMuted: '#dcfce7',
      borderFocus: '#16a34a',
      borderDanger: '#dc2626',
      borderStrong: '#052e16',
      borderInfo: '#16a34a',
      borderInverse: '#052e16',

      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryActive: '#166534',
      primarySubtle: '#bbf7d0',
      primaryForeground: '#ffffff',
      primaryBorder: '#86efac',

      success: '#16a34a',
      successForeground: '#ffffff',
      successSubtle: '#dcfce7',

      warning: '#f59e0b',
      warningForeground: '#052e16',
      warningSubtle: '#fef3c7',
      warningText: '#92400e',

      error: '#dc2626',
      errorForeground: '#ffffff',
      errorSubtle: '#fee2e2',

      info: '#16a34a',
      infoForeground: '#ffffff',
      infoSubtle: '#dcfce7',
      infoBorder: '#bbf7d0',

      label: '#374151',
      skeletonBg: '#dcfce7',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(22,163,74,0.15)',
      md: '0 4px 6px rgba(22,163,74,0.25)',
      lg: '0 10px 15px rgba(22,163,74,0.35)',
    },
  },
};
