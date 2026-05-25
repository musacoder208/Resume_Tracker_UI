/**
 * borders.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Design-system border structural tokens.
 *
 * Border Radius : 0 → 4 → 8 → 12 → 20 → full (9999 px)
 * Border Width  : 0 → 1 → 2 → 4 px
 * Border Style  : solid | dashed | dotted | none
 *
 * Border COLORS are NOT defined here.
 * Colors are theme-driven and live in ThemeColors (theme.types.ts).
 * Use Tailwind classes: border-border, border-border-focus, border-border-danger,
 * border-border-strong, border-border-info, border-border-inverse
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type BorderRadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type BorderWidthKey = 'none' | 'sm' | 'md' | 'lg';

export type BorderStyleKey = 'solid' | 'dashed' | 'dotted' | 'none';

export interface BorderRadiusValue {
  px: number;
  rem: string;
  css: string;
}

export interface BorderWidthValue {
  px: number;
  rem: string;
  css: string;
}

// ─── Border Radius ────────────────────────────────────────────────────────────

export const borderRadius: Record<BorderRadiusKey, BorderRadiusValue> = {
  none: { px: 0,    rem: '0rem',    css: '0px'    },
  sm:   { px: 4,    rem: '0.25rem', css: '4px'    },
  md:   { px: 8,    rem: '0.5rem',  css: '8px'    },
  lg:   { px: 12,   rem: '0.75rem', css: '12px'   },
  xl:   { px: 20,   rem: '1.25rem', css: '20px'   },
  full: { px: 9999, rem: '9999px',  css: '9999px' },
} as const;

// ─── Border Width ─────────────────────────────────────────────────────────────

export const borderWidth: Record<BorderWidthKey, BorderWidthValue> = {
  none: { px: 0, rem: '0rem',      css: '0px' },
  sm:   { px: 1, rem: '0.0625rem', css: '1px' },
  md:   { px: 2, rem: '0.125rem',  css: '2px' },
  lg:   { px: 4, rem: '0.25rem',   css: '4px' },
} as const;

// ─── Border Style ─────────────────────────────────────────────────────────────

export const borderStyle: Record<BorderStyleKey, BorderStyleKey> = {
  solid:  'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  none:   'none',
} as const;

// ─── Tailwind Config Helpers ──────────────────────────────────────────────────

export const tailwindBorderRadius: Record<string, string> = {
  none: borderRadius.none.css,
  sm:   borderRadius.sm.rem,
  md:   borderRadius.md.rem,
  lg:   borderRadius.lg.rem,
  xl:   borderRadius.xl.rem,
  full: borderRadius.full.css,
} as const;

export const tailwindBorderWidth: Record<string, string> = {
  DEFAULT: borderWidth.sm.css,
  '0': borderWidth.none.css,
  '1': borderWidth.sm.css,
  '2': borderWidth.md.css,
  '4': borderWidth.lg.css,
} as const;

// ─── Aggregated Export ────────────────────────────────────────────────────────

export const borders = {
  radius: borderRadius,
  width:  borderWidth,
  style:  borderStyle,
  tailwind: {
    borderRadius: tailwindBorderRadius,
    borderWidth:  tailwindBorderWidth,
  },
} as const;
