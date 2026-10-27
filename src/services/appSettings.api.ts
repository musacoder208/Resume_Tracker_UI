import { baseApi } from '@/services/baseApi';
import type { ApiResponse } from '@/types/apiResponse';

/** Used when the API has not answered yet or fails. */
export const DEFAULT_CALL_TOMORROW_TIME = '09:30';

// Raw API shape (snake_case) — values come from the backend .env
interface RawAppSettings {
  call_tomorrow_time: string;
}

export interface AppSettings {
  /** "HH:mm" (24h) for the activity form's "Call Tomorrow" shortcut */
  callTomorrowTime: string;
}

export const mapAppSettingsResponse = (raw: ApiResponse<RawAppSettings>): AppSettings => ({
  callTomorrowTime: raw.data?.call_tomorrow_time ?? DEFAULT_CALL_TOMORROW_TIME,
});

export const appSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetched once and cached — settings only change on a backend restart
    getAppSettings: builder.query<AppSettings, void>({
      query: () => ({
        url: 'common/app-settings',
        method: 'GET',
      }),
      transformResponse: mapAppSettingsResponse,
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useGetAppSettingsQuery } = appSettingsApi;
