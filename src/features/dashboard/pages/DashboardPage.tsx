import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/containers/PageContainer';
import { StatCard } from '@/components/ui/statCard';
import { DashboardSkeleton } from '@/components/ui/loader';
import { useGetDashboardSummaryQuery } from '../api/dashboard.api';
import type { ActivityType, DashboardSummary } from '../types/dashboard.types';
import {
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  TableCellsIcon,
  ExclamationCircleIcon,
} from '@/icons';

// ── Lookup maps ──────────────────────────────────────────────────────────────

const activityDotColor: Record<ActivityType, string> = {
  candidate_applied:   'bg-info',
  jd_published:        'bg-success',
  interview_scheduled: 'bg-warning',
  profile_updated:     'bg-primary',
  cv_reviewed:         'bg-info',
};

const QUICK_ACTIONS = [
  { key: 'companyProfile', route: '/company-profile', icon: BuildingOffice2Icon, iconBg: 'bg-primary/10', iconText: 'text-primary'  },
  { key: 'createJd',       route: '/jd/create',       icon: DocumentTextIcon,   iconBg: 'bg-warning/10', iconText: 'text-warning'  },
  { key: 'viewJdList',     route: '/jd',              icon: TableCellsIcon,     iconBg: 'bg-success/10', iconText: 'text-success'  },
  { key: 'candidates',     route: '/candidate',       icon: UsersIcon,          iconBg: 'bg-info/10',    iconText: 'text-info'     },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(isoDate: string): string {
  const diffMs  = Math.max(0, Date.now() - new Date(isoDate).getTime());
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)   return 'just now';
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24)  return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DashboardContent({ data, t, navigate }: {
  data: DashboardSummary;
  t: (key: string, opts?: Record<string, unknown>) => string;
  navigate: ReturnType<typeof useNavigate>;
}): JSX.Element {
  const stats = [
    { key: 'totalJobs',        value: data.stats.totalJobs,        icon: BriefcaseIcon,  color: 'primary'  as const, active: true  },
    { key: 'totalCandidates',  value: data.stats.totalCandidates,  icon: UsersIcon,      color: 'info'     as const, active: false },
    { key: 'activeInterviews', value: data.stats.activeInterviews, icon: CalendarIcon,   color: 'warning'  as const, active: false },
    { key: 'hiredThisMonth',   value: data.stats.hiredThisMonth,   icon: CheckCircleIcon,color: 'success'  as const, active: false },
    { key: 'pendingReviews',   value: data.stats.pendingReviews,   icon: ClockIcon,      color: 'error'    as const, active: false },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            label={t(`stats.${stat.key}`)}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            layout="vertical"
            active={stat.active}
          />
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">{t('recentActivity.title')}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t('recentActivity.events_other', { count: data.recentActivity.length })}
            </span>
          </div>

          {data.recentActivity.length === 0 ? (
            <p className="text-xs text-text-muted">{t('recentActivity.empty')}</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${activityDotColor[item.type]}`} />
                    <span className="truncate text-xs text-text">{item.description}</span>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-text">{t('quickActions.title')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => { void navigate(action.route); }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-shadow hover:border-primary/30 hover:shadow-md"
                >
                  <div className={`rounded-lg p-2.5 ${action.iconBg}`}>
                    <Icon className={`h-5 w-5 ${action.iconText}`} />
                  </div>
                  <span className="text-xs font-medium leading-tight text-text">
                    {t(`quickActions.${action.key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage(): JSX.Element {
  const { t } = useT('dashboard');
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetDashboardSummaryQuery();

  return (
    <PageContainer>
      {/* Overview header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">{t('overview.title')}</h1>
        <p className="mt-0.5 text-xs text-text-muted">{t('overview.subtitle')}</p>
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/5 p-4">
          <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-error" />
          <p className="text-xs text-error">{t('overview.loadError')}</p>
        </div>
      )}

      {data != null && (
        <DashboardContent data={data} t={t} navigate={navigate} />
      )}
    </PageContainer>
  );
}
