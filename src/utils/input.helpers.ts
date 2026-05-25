import type React from 'react';

const ALLOWED_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

/**
 * Prevents non-numeric key input on mobile number fields.
 * Blocks letters (including 'e'), symbols, and special characters.
 */
export const preventNonNumericInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  if (ALLOWED_KEYS.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
};
