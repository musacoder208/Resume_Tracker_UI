/**
 * typography.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Design-system typography tokens.
 *
 * Typeface  : Poppins (geometric sans-serif)
 * Mono      : Fira Code
 * Scale     : 11-step, from 7xl (64 px) → xs (12 px)
 * Base unit : 16 px / 1 rem
 *
 * This file is the single source of truth for all typography tokens.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type FontFamily = 'primary' | 'mono';

export type FontWeight = 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';

export type FontSizeKey =
  | 'xs'   // 12 px
  | 'sm'   // 14 px
  | 'base' // 16 px
  | 'lg'   // 18 px
  | 'xl'   // 20 px
  | '2xl'  // 24 px
  | '3xl'  // 32 px
  | '4xl'  // 40 px
  | '5xl'  // 48 px
  | '6xl'  // 56 px
  | '7xl'; // 64 px

export type LineHeightKey = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';

export type LetterSpacingKey =
  | 'tightest' // -0.03 em
  | 'tighter'  // -0.02 em
  | 'tight'    // -0.01 em
  | 'normal'   //  0
  | 'wide'     //  0.02 em
  | 'wider'    //  0.05 em
  | 'widest';  //  0.1  em

export type TextStyleKey =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'bodyLarge'
  | 'bodyBase'
  | 'bodySmall'
  | 'label'
  | 'labelSmall'
  | 'caption'
  | 'overline';

export interface FontSizeValue {
  /** Pixel reference only — always use rem in CSS. */
  px: number;
  rem: string;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: string;       // rem
  fontSizePx: number;
  fontWeight: number;
  lineHeight: string;     // unitless ratio
  lineHeightPx: number;
  letterSpacing: string;  // em
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

// ─── Font Families ────────────────────────────────────────────────────────────

export const fontFamilies: Record<FontFamily, string> = {
  primary:
    "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  mono:
    "'Fira Code', 'Cascadia Code', 'Roboto Mono', 'Courier New', Courier, monospace",
};

// ─── Font Weights ─────────────────────────────────────────────────────────────

export const fontWeights: Record<FontWeight, number> = {
  light:     300,
  regular:   400,
  medium:    500,
  semiBold:  600,
  bold:      700,
  extraBold: 800,
};

// ─── Font Sizes ───────────────────────────────────────────────────────────────

export const fontSizes: Record<FontSizeKey, FontSizeValue> = {
  xs:    { px: 12, rem: '0.75rem'  },
  sm:    { px: 14, rem: '0.875rem' },
  base:  { px: 16, rem: '1rem'     },
  lg:    { px: 18, rem: '1.125rem' },
  xl:    { px: 20, rem: '1.25rem'  },
  '2xl': { px: 24, rem: '1.5rem'   },
  '3xl': { px: 32, rem: '2rem'     },
  '4xl': { px: 40, rem: '2.5rem'   },
  '5xl': { px: 48, rem: '3rem'     },
  '6xl': { px: 56, rem: '3.5rem'   },
  '7xl': { px: 64, rem: '4rem'     },
};

// ─── Line Heights ─────────────────────────────────────────────────────────────

export const lineHeights: Record<LineHeightKey, number> = {
  none:    1,
  tight:   1.15,
  snug:    1.3,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2,
};

// ─── Letter Spacings ──────────────────────────────────────────────────────────

export const letterSpacings: Record<LetterSpacingKey, string> = {
  tightest: '-0.03em',
  tighter:  '-0.02em',
  tight:    '-0.01em',
  normal:   '0em',
  wide:     '0.02em',
  wider:    '0.05em',
  widest:   '0.1em',
};

// ─── Text Styles ──────────────────────────────────────────────────────────────

export const textStyles: Record<TextStyleKey, TextStyle> = {
  display: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes['6xl'].rem,
    fontSizePx:    fontSizes['6xl'].px,
    fontWeight:    fontWeights.bold,
    lineHeight:    String(lineHeights.tight),
    lineHeightPx:  Math.round(fontSizes['6xl'].px * lineHeights.tight),
    letterSpacing: letterSpacings.tightest,
  },
  h1: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes['5xl'].rem,
    fontSizePx:    fontSizes['5xl'].px,
    fontWeight:    fontWeights.bold,
    lineHeight:    String(lineHeights.tight),
    lineHeightPx:  Math.round(fontSizes['5xl'].px * lineHeights.tight),
    letterSpacing: letterSpacings.tighter,
  },
  h2: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes['4xl'].rem,
    fontSizePx:    fontSizes['4xl'].px,
    fontWeight:    fontWeights.bold,
    lineHeight:    String(lineHeights.tight),
    lineHeightPx:  Math.round(fontSizes['4xl'].px * lineHeights.tight),
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes['3xl'].rem,
    fontSizePx:    fontSizes['3xl'].px,
    fontWeight:    fontWeights.semiBold,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes['3xl'].px * lineHeights.snug),
    letterSpacing: letterSpacings.tight,
  },
  h4: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes['2xl'].rem,
    fontSizePx:    fontSizes['2xl'].px,
    fontWeight:    fontWeights.semiBold,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes['2xl'].px * lineHeights.snug),
    letterSpacing: letterSpacings.normal,
  },
  h5: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.xl.rem,
    fontSizePx:    fontSizes.xl.px,
    fontWeight:    fontWeights.semiBold,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes.xl.px * lineHeights.snug),
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.lg.rem,
    fontSizePx:    fontSizes.lg.px,
    fontWeight:    fontWeights.semiBold,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes.lg.px * lineHeights.snug),
    letterSpacing: letterSpacings.normal,
  },
  bodyLarge: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.base.rem,
    fontSizePx:    fontSizes.base.px,
    fontWeight:    fontWeights.regular,
    lineHeight:    String(lineHeights.normal),
    lineHeightPx:  Math.round(fontSizes.base.px * lineHeights.normal),
    letterSpacing: letterSpacings.normal,
  },
  bodyBase: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.sm.rem,
    fontSizePx:    fontSizes.sm.px,
    fontWeight:    fontWeights.regular,
    lineHeight:    String(lineHeights.normal),
    lineHeightPx:  Math.round(fontSizes.sm.px * lineHeights.normal),
    letterSpacing: letterSpacings.normal,
  },
  bodySmall: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.xs.rem,
    fontSizePx:    fontSizes.xs.px,
    fontWeight:    fontWeights.regular,
    lineHeight:    String(lineHeights.normal),
    lineHeightPx:  Math.round(fontSizes.xs.px * lineHeights.normal),
    letterSpacing: letterSpacings.wide,
  },
  label: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.sm.rem,
    fontSizePx:    fontSizes.sm.px,
    fontWeight:    fontWeights.medium,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes.sm.px * lineHeights.snug),
    letterSpacing: letterSpacings.wide,
  },
  labelSmall: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.xs.rem,
    fontSizePx:    fontSizes.xs.px,
    fontWeight:    fontWeights.medium,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes.xs.px * lineHeights.snug),
    letterSpacing: letterSpacings.wider,
  },
  caption: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.xs.rem,
    fontSizePx:    fontSizes.xs.px,
    fontWeight:    fontWeights.regular,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes.xs.px * lineHeights.snug),
    letterSpacing: letterSpacings.wide,
  },
  overline: {
    fontFamily:    fontFamilies.primary,
    fontSize:      fontSizes.xs.rem,
    fontSizePx:    fontSizes.xs.px,
    fontWeight:    fontWeights.semiBold,
    lineHeight:    String(lineHeights.snug),
    lineHeightPx:  Math.round(fontSizes.xs.px * lineHeights.snug),
    letterSpacing: letterSpacings.widest,
    textTransform: 'uppercase',
  },
};

// ─── Tailwind Compatible Format ───────────────────────────────────────────────

/**
 * Plug directly into `theme.extend.fontSize` inside tailwind.config.js.
 */
export const tailwindTypography: Record<
  string,
  [string, { lineHeight: string; letterSpacing: string; fontWeight: string }]
> = {
  xs:    [fontSizes.xs.rem,    { lineHeight: '1.3',  letterSpacing: '0.02em',  fontWeight: '400' }],
  sm:    [fontSizes.sm.rem,    { lineHeight: '1.5',  letterSpacing: '0em',     fontWeight: '400' }],
  base:  [fontSizes.base.rem,  { lineHeight: '1.5',  letterSpacing: '0em',     fontWeight: '400' }],
  lg:    [fontSizes.lg.rem,    { lineHeight: '1.3',  letterSpacing: '0em',     fontWeight: '600' }],
  xl:    [fontSizes.xl.rem,    { lineHeight: '1.3',  letterSpacing: '0em',     fontWeight: '600' }],
  '2xl': [fontSizes['2xl'].rem,{ lineHeight: '1.3',  letterSpacing: '0em',     fontWeight: '600' }],
  '3xl': [fontSizes['3xl'].rem,{ lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '600' }],
  '4xl': [fontSizes['4xl'].rem,{ lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
  '5xl': [fontSizes['5xl'].rem,{ lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
  '6xl': [fontSizes['6xl'].rem,{ lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '700' }],
  '7xl': [fontSizes['7xl'].rem,{ lineHeight: '1.1',  letterSpacing: '-0.03em', fontWeight: '800' }],
};

export const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacings,
  textStyles,
  tailwindTypography,
};
