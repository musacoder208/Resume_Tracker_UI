export type User = {
  userId: number;
  name?: string;
  role?: string;
};

export type PageAccess = {
  page_name: string;
  route: string;
  icon: string | null;
  display_order: number;
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
  permissions: string[];
  pageAccess: PageAccess[];
};
