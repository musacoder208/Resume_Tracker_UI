export interface ApiResponse<T = unknown> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
}
