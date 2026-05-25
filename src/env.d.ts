interface ImportMetaEnv {
  readonly VITE_SERVER_MODE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_SERVICE_BASE_URL: string;
  readonly VITE_ADMIN_SERVICE_BASE_URL: string;
  readonly VITE_ORGANIZATION_SERVICE_BASE_URL: string;
  readonly VITE_DEMO_API_BASE_URL: string;
  readonly VITE_DEPARTMENT_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
