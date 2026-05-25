// utils/regex.constants.ts

/**
 * Shared regex patterns used across the application
 */

// Default regex patterns
export const DEFAULT_REGEX = {
  ALPHANUMERIC_WITH_SPECIAL: /^[A-Za-z0-9]+(?:[ .&-][A-Za-z0-9]+)*$/,
  ALPHA_WITH_SPECIAL: /^[A-Za-z]+(?:[ &-][A-Za-z]+)*$/,
  ADDRESS: /^(?=.*[A-Za-z])[A-Za-z0-9\s,./\-\n]+$/,
  MOBILE_10_DIGIT: /^\d{10}$/,
  MOBILE_UNIVERSAL: /^\+?[1-9]\d{6,14}$/,
  /** Common mobile number: 7 to 15 digits only */
  MOBILE_NUMBER: /^\d{7,15}$/,
  /** Telephone: optional +, digits, spaces, hyphens, parentheses (8–20 chars) */
  TELEPHONE: /^[+]?[\d\s\-()]{8,20}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  REMARK: /^[A-Za-z0-9\s,./\-&()]+$/,
  /** Person name: Unicode letters, spaces, hyphens, apostrophes */
  PERSON_NAME: /^[\p{L}]+([ '-][\p{L}]+)*$/u,
  /** Alphanumeric with symbols: ( ) . [ ] , - ' and spaces. Must contain at least one letter or number */
  ALPHANUMERIC_WITH_SYMBOLS: /^(?=.*[A-Za-z])[A-Za-z0-9().,[\]'\s-]+$/,
  /** Non-negative integer: digits only (0 and positive numbers, no leading zeros except standalone 0) */
  POSITIVE_INTEGER: /^(0|[1-9]\d*)$/,
} as const;

export const LENGTH_LIMIT = {
  /** Validates string length: max 50 characters */
  MAX_50: 50,
  /** Validates string length: max 100 characters */
  MAX_100: 100,
  /** Validates string length: max 200 characters */
  MAX_200: 200,
  /** Validates string length: max 500 characters */
  MAX_500: 500,
  /** Validates string length: max 1000 characters */
  MAX_1000: 1000,
} as const;

export const LENGTH_REGEX = {
  /** Matches 1–100 characters (including newlines) */
  MAX_100: /^.{1,100}$/s,
  /** Matches 1–200 characters (including newlines) */
  MAX_200: /^.{1,200}$/s,
  /** Matches 1–500 characters (including newlines) */
  MAX_500: /^.{1,500}$/s,
} as const;

export const DEPARTMENT_REGEX = {
  NAME: /^[A-Za-z]+(?:[ &-]+[A-Za-z]+)*$/,
} as const;

export const ORGANIZATION_REGEX = {
  NAME: /^[A-Za-z0-9]+(?:[ .&-][A-Za-z0-9]+)*$/,
  MOBILE: /^\d{10}$/,
} as const;

export const PASSWORD_REGEX = {
  /** At least one uppercase, one lowercase, one digit, one special character */
  STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
} as const;
