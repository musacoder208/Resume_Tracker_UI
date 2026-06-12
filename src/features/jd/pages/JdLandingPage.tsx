import { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select/Select';
import { useT } from '@/i18n/useT';
import { EyeIcon, ArrowUpTrayIcon, PlusIcon, XMarkIcon } from '@/icons';
import { useGetMasterDataQuery, useLazyGetAllJDsQuery } from '../api/jd.api';
import { JdStatCardSkeleton, JdTableSkeleton } from '@/components/ui/loader';
import type { MasterDataItem, JdListItem, GetAllJDsParams } from '../types/jd.types';
import type { ApiError } from '@/types/apiError';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatExperience(min: number | null, max: number | null): string {
  if (min == null && max == null) return '—';
  if (min != null && max != null) return `${min}–${max} years`;
  if (min != null) return `${min}+ years`;
  return `Up to ${max!} years`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function WorkModelBadge({ value }: { value: string | null }): JSX.Element {
  if (value == null) return <span className="text-xs text-text-muted">—</span>;
  const normalized = value.toLowerCase().replace(/[-\s]/g, '');
  const colorClass =
    normalized === 'remote' || normalized === 'fullyremote'
      ? 'bg-success/10 text-success'
      : normalized === 'hybrid'
      ? 'bg-info/10 text-info'
      : 'bg-surface-muted text-text-muted';
  const display = value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {display}
    </span>
  );
}

function ActionButton({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 text-xs ${
        danger === true ? 'text-error hover:text-error/70' : 'text-text-muted hover:text-text'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function JdTableRow({
  item,
  index,
  t,
  onView,
}: {
  item: JdListItem;
  index: number;
  t: (key: string) => string;
  onView: (id: number) => void;
}): JSX.Element {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-muted/40">
      <td className="px-4 py-4 text-xs text-text-muted">{index + 1}</td>
      <td className="px-4 py-4">
        <p className="text-xs font-semibold text-text">{item.job_title}</p>
      </td>
      <td className="px-4 py-4 text-xs text-text">{item.seniority}</td>
      <td className="px-4 py-4">
        <WorkModelBadge value={item.work_model} />
      </td>
      <td className="px-4 py-4 text-xs text-text">
        {formatExperience(item.min_exp, item.max_exp)}
      </td>
      <td className="px-4 py-4 text-xs text-text-muted">—</td>
      <td className="px-4 py-4 text-xs text-text-muted">—</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <ActionButton
            icon={<EyeIcon className="h-4 w-4" />}
            label={t('actions.view')}
            onClick={() => { onView(item.jd_id); }}
          />
          <ActionButton icon={<ArrowUpTrayIcon className="h-4 w-4" />} label={t('actions.upload')} />
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function JdLandingPage(): JSX.Element {
  const { t } = useT('jd');
  const navigate = useNavigate();

  const [selectedJobTitle, setSelectedJobTitle] = useState<MasterDataItem | null>(null);
  const [selectedSeniority, setSelectedSeniority] = useState<MasterDataItem | null>(null);

  const { data: masterData } = useGetMasterDataQuery();
  const [triggerGetAllJDs, { data: jdData, isLoading, isError, error }] = useLazyGetAllJDsQuery();

  // Fetch all JDs on initial load
  useEffect(() => {
    void triggerGetAllJDs({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(params?: GetAllJDsParams): void {
    void triggerGetAllJDs(params ?? {
      job_title_id: selectedJobTitle?.id,
      seniority_id: selectedSeniority?.id,
    });
  }

  function handleClear(): void {
    setSelectedJobTitle(null);
    setSelectedSeniority(null);
    void triggerGetAllJDs({});
  }

  const counts = jdData?.counts;
  const list = jdData?.list ?? [];

  const countBoxes = [
    { label: t('landing.counts.totalJds'), value: counts?.totalJds ?? 0 },
    { label: t('landing.counts.addedThisWeek'), value: counts?.addedThisWeek ?? 0 },
    { label: t('landing.counts.remoteRoles'), value: counts?.remoteRoles ?? 0 },
    { label: t('landing.counts.hybridRoles'), value: counts?.hybridRoles ?? 0 },
  ];

  const tableHeaders = [
    t('landing.table.no'),
    t('landing.table.jobTitle'),
    t('landing.table.seniority'),
    t('landing.table.workType'),
    t('landing.table.experience'),
    t('landing.table.resumes'),
    t('landing.table.createdDate'),
    t('landing.table.actions'),
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-text">{t('landing.title')}</h1>
            <p className="mt-0.5 text-xs text-text-muted">{t('landing.subtitle')}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => { navigate('/jd/create'); }}
          >
            {t('actions.createJd')}
          </Button>
        </div>

        {/* Count boxes */}
        {isLoading ? (
          <JdStatCardSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {countBoxes.map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-2xl font-bold text-text">{value}</p>
                <p className="mt-1 text-xs text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">

          {/* Job Title dropdown with × */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-text-muted">{t('fields.jobTitle')}</label>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <Select<MasterDataItem>
                  value={selectedJobTitle}
                  onChange={setSelectedJobTitle}
                  options={masterData?.jobTitles ?? []}
                  getOptionKey={(opt) => opt.id}
                  renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
                  renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
                  placeholder={<span className="text-xs text-text-muted">{t('landing.allJobTitles')}</span>}
                />
              </div>
              {selectedJobTitle != null && (
                <button
                  type="button"
                  onClick={() => { setSelectedJobTitle(null); }}
                  className="mt-2 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Seniority dropdown with × */}
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-text-muted">{t('fields.seniorityLevel')}</label>
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <Select<MasterDataItem>
                  value={selectedSeniority}
                  onChange={setSelectedSeniority}
                  options={masterData?.seniorities ?? []}
                  getOptionKey={(opt) => opt.id}
                  renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
                  renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
                  placeholder={<span className="text-xs text-text-muted">{t('landing.allSeniorities')}</span>}
                />
              </div>
              {selectedSeniority != null && (
                <button
                  type="button"
                  onClick={() => { setSelectedSeniority(null); }}
                  className="mt-2 rounded-md p-1 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search & Clear buttons */}
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => { handleSearch(); }}
              disabled={isLoading}
            >
              {t('actions.search')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
            >
              {t('actions.clearFilters')}
            </Button>
          </div>

        </div>

        {/* Table */}
        {isLoading ? (
          <JdTableSkeleton />
        ) : isError && (error as ApiError)?.meta?.kind !== 'auth' ? (
          <p className="text-xs text-error">{t('errors.fetchFailed')}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    {tableHeaders.map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-text-muted"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-xs text-text-muted">
                        {t('landing.empty')}
                      </td>
                    </tr>
                  ) : (
                    list.map((item, index) => (
                      <JdTableRow
                        key={item.jd_id}
                        item={item}
                        index={index}
                        t={t}
                        onView={(id) => { navigate(`/jd/create/${id}`); }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
