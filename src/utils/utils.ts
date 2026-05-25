export function rtlFlipClass(): string {
  return 'rtl:rotate-180';
}

export function isCallable(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function allowOnlyDigits(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
}

export function allowOnlyPositiveNumbers(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (e.key === '-' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
}
