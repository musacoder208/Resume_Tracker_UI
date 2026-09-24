function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Splits an ISO datetime into local-timezone date ("YYYY-MM-DD") and time ("HH:mm") parts for the pickers. */
export function splitISODateTime(iso: string | null): { date: string; time: string } {
  if (iso == null || iso === '') return { date: '', time: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

/** Combines local-timezone date ("YYYY-MM-DD") + time ("HH:mm") pickers into an ISO datetime for the API. */
export function combineToISODateTime(date: string, time: string): string | null {
  if (date === '' || time === '') return null;
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const combined = new Date(y, m - 1, d, hh, mm);
  if (isNaN(combined.getTime())) return null;
  return combined.toISOString();
}

export function formatDisplayDateTime(iso: string | null): string {
  if (iso == null || iso === '') return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const datePart = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  const timePart = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
  return `${datePart} · ${timePart}`;
}

export function formatTimeLabel(hhmm: string): string {
  const [hh, mm] = hhmm.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${pad2(mm)} ${period}`;
}

export const TIME_OPTIONS: string[] = ((): string[] => {
  const out: string[] = [];
  for (let hh = 0; hh < 24; hh++) {
    for (let mm = 0; mm < 60; mm += 30) {
      out.push(`${pad2(hh)}:${pad2(mm)}`);
    }
  }
  return out;
})();
