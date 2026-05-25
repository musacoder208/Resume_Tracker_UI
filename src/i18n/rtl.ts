export const RTL_LANGS = ['ar', 'he', 'fa', 'ur'] as const;

export function isRtlLanguage(lang: string): boolean {
  return RTL_LANGS.includes(lang as typeof RTL_LANGS[number]);
}

export function applyDirection(lang: string): void {
  const dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
}
