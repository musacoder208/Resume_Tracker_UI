import type { User } from '../types/auth.types';

type RawAuthResponse = {
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    sessionExpiresAt?: string;
    permissions?: string[];
  };
};

export const mapAuthResponse = (raw: RawAuthResponse): { user: User; sessionExpiresAt: string | null } => ({
  user: {
    id: raw.data.id,
    name: raw.data.name,
    email: raw.data.email,
    role: raw.data.role,
    permissions: raw.data.permissions ?? [],
  },
  sessionExpiresAt: raw.data.sessionExpiresAt ?? null,
});
