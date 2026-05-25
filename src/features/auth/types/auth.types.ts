export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

export type Tenant = {
  id: string;
  name: string;
  code: string;
};

export type Permission = string;

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  sessionExpiresAt: string | null;
};
