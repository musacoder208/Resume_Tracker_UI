// ── Raw API shapes (exactly as returned by GET /api/dashboard/summary) ───────

export interface RawDashboardStats {
  totalJobs: number;
  totalCandidates: number;
  activeInterviews: number;
  hiredThisMonth: number;
  pendingReviews: number;
}

export type ActivityType =
  | 'candidate_applied'
  | 'jd_published'
  | 'interview_scheduled'
  | 'profile_updated'
  | 'cv_reviewed';

export interface RawActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: string;
}

export interface RawDashboardSummary {
  stats: RawDashboardStats;
  recentActivity: RawActivityItem[];
}

// ── Mapped UI types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalJobs: number;
  totalCandidates: number;
  activeInterviews: number;
  hiredThisMonth: number;
  pendingReviews: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: string;
}

export interface DashboardSummary {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}
