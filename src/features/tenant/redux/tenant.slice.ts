import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TenantConfig } from '../types/tenant.types';

type TenantState = {
  config: TenantConfig | null;
};

const initialState: TenantState = {
  config: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenantConfig(state, action: PayloadAction<TenantConfig>) {
      state.config = action.payload;
    },
    clearTenantConfig(state) {
      state.config = null;
    },
  },
});

export const { setTenantConfig, clearTenantConfig } = tenantSlice.actions;
export const tenantReducer = tenantSlice.reducer;
