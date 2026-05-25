export function downloadFile(url: string, filename?: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename ?? url.split('/').pop() ?? 'download';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
