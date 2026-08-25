import type { JSX } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import { BriefcaseIcon, MapPinIcon, EnvelopeIcon, ExclamationCircleIcon } from '@/icons';
import { Button } from '@/components/ui/button';
import type {
  SuccessCandidate,
  DuplicateCandidate,
  IncompleteCandidate,
  CandidateDrawerData,
} from '../types/candidate.types';

type CandidateVariantProps =
  | { variant: 'success'; candidate: SuccessCandidate }
  | { variant: 'duplicate'; candidate: DuplicateCandidate }
  | { variant: 'incomplete'; candidate: IncompleteCandidate };

type CandidateCardProps = CandidateVariantProps & {
  onViewDetails: (data: CandidateDrawerData) => void;
  layout?: 'card' | 'row';
  isSelected?: boolean;
  onToggle?: () => void;
};

function CandidateAvatar({ name }: { name: string }): JSX.Element {
  const initials = name
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary">
      {initials || '?'}
    </div>
  );
}

export function CandidateCard(props: CandidateCardProps): JSX.Element {
  const { t } = useT('candidate');
  const { layout = 'card', isSelected = false, onToggle } = props;
  const { variant, candidate } = props;

  const isDuplicate = variant === 'duplicate';
  const isIncomplete = variant === 'incomplete';

  const {
    name,
    jobTitle,
    currentCompany,
    totalExperienceYears,
    email,
    location,
    allSkills,
    education,
    workHistory,
    resumeFilePath,
  } = candidate;

  const topSkills =
    props.variant === 'success' || props.variant === 'duplicate'
      ? props.candidate.topSkills
      : [];

  const duplicateReason = props.variant === 'duplicate' ? props.candidate.duplicateReason : null;
  const reviewReason = props.variant === 'incomplete' ? props.candidate.reviewReason : null;

  const drawerData: CandidateDrawerData = {
    name,
    jobTitle,
    currentCompany,
    totalExperienceYears,
    email,
    phone: candidate.phone,
    location,
    allSkills,
    education,
    workHistory,
    resumeFilePath,
  };

  const variantBadge =
    isDuplicate ? (
      <span className="shrink-0 rounded-full bg-warning-subtle px-2 py-0.5 text-xs font-semibold text-warning">
        {t('card.duplicate')}
      </span>
    ) : isIncomplete ? (
      <span className="shrink-0 rounded-full bg-error-subtle px-2 py-0.5 text-xs font-semibold text-error">
        {t('card.needsReview')}
      </span>
    ) : null;

  const reasonBanner =
    isDuplicate && duplicateReason != null ? (
      <div className="flex items-start gap-1.5 rounded-lg bg-warning-subtle/40 px-2.5 py-2">
        <ExclamationCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
        <p className="text-xs text-warning">{duplicateReason}</p>
      </div>
    ) : isIncomplete && reviewReason != null ? (
      <div className="flex items-start gap-1.5 rounded-lg bg-error-subtle/30 px-2.5 py-2">
        <ExclamationCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-error" />
        <p className="text-xs text-error">{reviewReason}</p>
      </div>
    ) : null;

  // ── Row layout ──────────────────────────────────────────────────────────────
  if (layout === 'row') {
    const rowSkills = allSkills.slice(0, 4);
    const rowOverflow = allSkills.length > 4 ? allSkills.length - 4 : 0;

    const metaParts = [email, `${totalExperienceYears} ${t('card.years')}`, location].filter(
      (p) => p !== '',
    );

    return (
      <div className="flex items-start gap-4 py-4">
        {/* Checkbox */}
        {onToggle != null && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            onClick={(e) => { e.stopPropagation(); }}
            className="mt-3 h-4 w-4 shrink-0 cursor-pointer accent-primary"
          />
        )}
        <CandidateAvatar name={name} />

        <div className="min-w-0 flex-1">
          {/* Line 1: name + badge */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text">{name}</p>
            {variantBadge}
          </div>

          {/* Line 2: email · X yrs · location */}
          {metaParts.length > 0 && (
            <p className="mt-0.5 text-xs text-text-muted">{metaParts.join(' · ')}</p>
          )}

          {/* Line 3: skills */}
          {rowSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {rowSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-text"
                >
                  {skill}
                </span>
              ))}
              {rowOverflow > 0 && (
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-text-muted">
                  +{rowOverflow}
                </span>
              )}
            </div>
          )}

          {/* Reason banner */}
          {reasonBanner != null && <div className="mt-2">{reasonBanner}</div>}
        </div>

        {/* View Details */}
        <Button
          variant="secondary"
          size="xs"
          onClick={() => { props.onViewDetails(drawerData); }}
        >
          {t('card.viewDetails')}
        </Button>
      </div>
    );
  }

  // ── Card layout (default) ───────────────────────────────────────────────────
  return (
    <div
      className={clsx(
        'flex flex-col rounded-xl border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md',
        isDuplicate && 'border-warning/40',
        isIncomplete && 'border-error/30',
        !isDuplicate && !isIncomplete && 'border-border',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <CandidateAvatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-text">{name}</p>
            {variantBadge}
          </div>
          <p className="truncate text-xs text-text-muted">{jobTitle}</p>
          {currentCompany !== '' && (
            <p className="truncate text-xs text-text-muted">@ {currentCompany}</p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {location !== '' && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[8rem] truncate">{location}</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <BriefcaseIcon className="h-3.5 w-3.5 shrink-0" />
          {totalExperienceYears} {t('card.years')}
        </span>
        {email !== '' && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[10rem] truncate">{email}</span>
          </span>
        )}
      </div>

      <div className="my-3 h-px bg-border-muted" />

      {/* Top skills */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Reason banners */}
      {reasonBanner != null && <div className="mt-2">{reasonBanner}</div>}

      {/* Footer action */}
      <div className="mt-3 flex justify-end border-t border-border-muted pt-3">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => { props.onViewDetails(drawerData); }}
        >
          {t('card.viewDetails')}
        </Button>
      </div>
    </div>
  );
}
