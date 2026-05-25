import type { TenantConfig } from '../types/tenant.types';
import type { RootState } from '@/app/store/store';

export const selectTenantMenu = (state: RootState): TenantConfig['menu'] =>
  state.tenant.config?.menu;
