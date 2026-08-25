
export type ThemeName = 'eqas' | 'light' | 'dark' | 'blue' | 'green';

export const DEFAULT_THEME: ThemeName = 'eqas';

export interface ThemeColors {
  /* Background */
  background: string;
  backgroundSubtle: string;

  /* Surface */
  surface: string;
  surfaceMuted: string;
  surfaceHover: string;
  surfaceElevated: string;
  surfaceActive: string;
  surfaceDisabled: string;

  /* Text */
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverted: string;
  textDisabled: string;

  /* Border */
  border: string;
  borderMuted: string;
  borderFocus: string;
  borderDanger: string;
  borderStrong: string;  // prominent dark outline — selected rows, active cards
  borderInfo: string;    // interactive / informational blue
  borderInverse: string; // on-dark surfaces

  /* Primary */
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primarySubtle: string;
  primaryForeground: string;
  primaryBorder: string;

  /* Status */
  success: string;
  successForeground: string;
  successSubtle: string;

  warning: string;
  warningForeground: string;
  warningSubtle: string;
  warningText: string;

  error: string;
  errorForeground: string;
  errorSubtle: string;

  info: string;
  infoForeground: string;
  infoSubtle: string;
  infoBorder: string;

  label: string;
  skeletonBg: string;

  /* Gradient accent pair */
  accent: string;
  accent2: string;
}

export interface ThemeFont {
  familyPrimary: string;
  familyMono: string;
  sizeBase: string;
  weightLight: string;
  weightNormal: string;
  weightMedium: string;
  weightSemibold: string;
  weightBold: string;
  weightExtraBold: string;
}

export interface ThemeRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeBorderWidth {
  none: string;
  sm: string;  // 1px — default
  md: string;  // 2px — focus / brand
  lg: string;  // 4px — heavy emphasis
}

export interface ThemeShadow {
  sm: string;
  md: string;
  lg: string;
}

export interface TenantTheme {
  colors: ThemeColors;
  font: ThemeFont;
  radius: ThemeRadius;
  borderWidth: ThemeBorderWidth;
  shadow: ThemeShadow;
}

