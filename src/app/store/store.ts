import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/services/baseApi';
import { authReducer } from '@/features/auth/redux/auth.slice';
import { tenantReducer } from '@/features/tenant/redux/tenant.slice';
import { apiToastMiddleware } from '../middleware/apiToastMiddleware';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    tenant: tenantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['executeMutation', 'executeQuery'],
        ignoredPaths: [baseApi.reducerPath],
      },
    })
      .concat(baseApi.middleware)
      .concat(apiToastMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
