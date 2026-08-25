import type { User, PageAccess } from '../types/auth.types';

type RawPageAccess = {
  page_name: string;
  route: string;
  icon: string | null;
  display_order: number;
  permissions: string[];
};

type RawLoginResponse = {
  data: {
    user: {
      userId: number;
    };
    page_access: RawPageAccess[];
    permissions: string[];
    sessionExpiresIn: string;
  };
};

export type MappedAuthData = {
  user: User;
  pageAccess: PageAccess[];
  permissions: string[];
  sessionExpiresAt: string | null;
};

export const mapLoginResponse = (raw: RawLoginResponse): MappedAuthData => ({
  user: { userId: raw.data.user.userId },
  pageAccess: raw.data.page_access,
  permissions: raw.data.permissions,
  sessionExpiresAt: raw.data.sessionExpiresIn ?? null,
});

// /auth/session returns the same shape as /auth/login
export const mapAuthResponse = mapLoginResponse;
