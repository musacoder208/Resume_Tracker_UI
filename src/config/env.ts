export const env = {
  SERVER_MODE: import.meta.env.VITE_SERVER_MODE,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  AUTH_SERVICE_BASE_URL: import.meta.env.VITE_AUTH_SERVICE_BASE_URL,
} as const;
