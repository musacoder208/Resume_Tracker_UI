import type { ApiResponse } from '@/types/apiResponse';
import type { RawDashboardSummary, DashboardSummary } from '../types/dashboard.types';

export const mapDashboardSummaryResponse = (
  raw: ApiResponse<RawDashboardSummary>,
): DashboardSummary => ({
  stats: {
    totalJobs:        raw.data.stats.totalJobs,
    totalCandidates:  raw.data.stats.totalCandidates,
    activeInterviews: raw.data.stats.activeInterviews,
    hiredThisMonth:   raw.data.stats.hiredThisMonth,
    pendingReviews:   raw.data.stats.pendingReviews,
  },
  recentActivity: raw.data.recentActivity.map((item) => ({
    id:          item.id,
    type:        item.type,
    description: item.description,
    createdAt:   item.createdAt,
  })),
});
