export const env = {
  SERVER_MODE: import.meta.env.VITE_SERVER_MODE,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  AUTH_SERVICE_BASE_URL: import.meta.env.VITE_AUTH_SERVICE_BASE_URL,
  // "HH:mm" (24h) used by the activity form's "Call Tomorrow" shortcut.
  CALL_TOMORROW_TIME: import.meta.env.VITE_CALL_TOMORROW_TIME ?? '09:30',
} as const;
