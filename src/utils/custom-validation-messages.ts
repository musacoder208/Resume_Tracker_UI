export function showErrorModal(title: string, details?: unknown, code?: string): void {
  if (!window.__emitErrorModal) {
    alert(`${title}${code ? ` (Code: ${code})` : ''}`);
    return;
  }

  window.__emitErrorModal({
    title,
    message: '',
    code,
    details,
    variant: 'error',
    primaryActionLabel: 'OK',
  });
}
