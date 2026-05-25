export const REGEX = {
  PIN_CODE:     /^\d{6}$/,
  MOBILE_PHONE: /^\d{10}$/,
  LANDLINE:     /^(\d{3,5}[- ]?\d{6,8})(\s?(ext|x|extension)\s?\d{1,5})?$/i,
} as const;
