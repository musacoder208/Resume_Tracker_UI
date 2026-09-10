import type { JSX } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import {
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  BuildingOfficeIcon,
} from '@/icons';
import type { CandidateListItem } from '../types/candidate.types';
import { HrStatusBadge } from '../hrStatusIcon';

interface CandidateListCardProps {
  candidate: CandidateListItem;
  onClick: () => void;
}

const MAX_VISIBLE_SKILLS = 4;

const SKILL_CHIP_CLASS = 'rounded-full border border-border bg-surface text-text-muted';

const AVATAR_PALETTE = [
  'bg-primary/15 text-primary',
  'bg-success/15 text-success',
  'bg-warning/15 text-warning',
  'bg-error/15 text-error',
];

const VERDICT_STYLES: Record<string, string> = {
  'Excellent Match': 'bg-success/10 text-success',
  'Strong Match': 'bg-primary/10 text-primary',
  'Good Match': 'bg-primary/10 text-primary',
  'Moderate Match': 'bg-warning/10 text-warning',
  'Weak Match': 'bg-error/10 text-error',
};

function getAvatarClass(name: string): string {
  return AVATAR_PALETTE[(name.charCodeAt(0) ?? 65) % AVATAR_PALETTE.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getScoreColorClass(score: number): string {
  if (score >= 75) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-error';
}

function getScoreStrokeClass(score: number): string {
  if (score >= 75) return 'stroke-success';
  if (score >= 50) return 'stroke-warning';
  return 'stroke-error';
}

const fmt = (n: number): number => parseFloat(n.toFixed(2));

interface ScoreSectionProps {
  score: number;
  verdict: string | null;
}

function ScoreSection({ score, verdict }: ScoreSectionProps): JSX.Element {
  const circumference = 2 * Math.PI * 15.9;
  const dash = (score / 100) * circumference;
  const colorClass = getScoreColorClass(score);
  const strokeClass = getScoreStrokeClass(score);
  const verdictStyle = verdict != null ? (VERDICT_STYLES[verdict] ?? 'bg-surface-muted text-text-muted') : '';

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="relative h-14 w-14">
        <svg className="-rotate-90 h-full w-full" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5" className="stroke-border" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}`}
            className={clsx('transition-all', strokeClass)}
          />
        </svg>
        <span className={clsx('absolute inset-0 flex items-center justify-center text-xs font-bold', colorClass)}>
          {fmt(score)}%
        </span>
      </div>
      {verdict != null && (
        <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', verdictStyle)}>
          {verdict}
        </span>
      )}
    </div>
  );
}

function PendingSection({ pendingBadge }: { pendingBadge: string }): JSX.Element {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border">
        <ClockIcon className="h-6 w-6 text-text-muted" />
      </div>
      <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
        {pendingBadge}
      </span>
    </div>
  );
}

export function CandidateListCard({ candidate, onClick }: CandidateListCardProps): JSX.Element {
  const { t } = useT('candidate');
  const avatarClass = getAvatarClass(candidate.fullName);
  const initials = getInitials(candidate.fullName);
  const visibleSkills = candidate.technicalSkills.slice(0, MAX_VISIBLE_SKILLS);
  const remainingSkills = candidate.technicalSkills.slice(MAX_VISIBLE_SKILLS);
  const extraCount = remainingSkills.length;

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    // Named group "card" — isolates group-hover from the nested tooltip group
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group/card cursor-pointer rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* HR status indicator — Selected / Rejected / Pending — own row, left-aligned, above the name so it never overlaps the score/pending circle */}
      {candidate.hrStatusCode != null && (
        <div className="mb-2 flex justify-start">
          <HrStatusBadge code={candidate.hrStatusCode} label={candidate.hrStatusLabel} />
        </div>
      )}

      {/* Top row: avatar + name + score/pending */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold', avatarClass)}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text transition-colors group-hover/card:text-primary">
              {candidate.fullName}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="truncate text-xs text-text-muted">{candidate.currentJobTitle}</span>
              {candidate.currentCompany && (
                <>
                  <span className="text-xs text-border">·</span>
                  <span className="flex items-center gap-1 truncate text-xs text-text-muted">
                    <BuildingOfficeIcon className="h-3 w-3 shrink-0" />
                    {candidate.currentCompany}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {candidate.finalScore != null
          ? <ScoreSection score={candidate.finalScore} verdict={candidate.verdict} />
          : <PendingSection pendingBadge={t('listCard.pendingBadge')} />
        }
      </div>

      {/* Info row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {candidate.location !== '' && (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            {candidate.location}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <BriefcaseIcon className="h-3.5 w-3.5 shrink-0" />
          {candidate.totalExperience} {t('listCard.exp')}
        </span>
        {candidate.degree !== '' && (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <AcademicCapIcon className="h-3.5 w-3.5 shrink-0" />
            {candidate.degree}
          </span>
        )}
      </div>

      {/* Skills row */}
      {visibleSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className={clsx('rounded-md px-2 py-0.5 text-xs font-medium', SKILL_CHIP_CLASS)}
            >
              {skill}
            </span>
          ))}

          {/* "+N more" chip — named group "more" to isolate tooltip from card group */}
          {extraCount > 0 && (
            <div className="group/more relative inline-flex">
              <span className="cursor-default rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-muted ring-1 ring-inset ring-border">
                +{extraCount} {t('listCard.more')}
              </span>

              {/* Tooltip — only shows on hover of "+N more", not the whole card */}
              <div className="pointer-events-none absolute bottom-full start-0 z-20 mb-2 flex flex-col opacity-0 transition-opacity duration-150 group-hover/more:pointer-events-auto group-hover/more:opacity-100">
                <div className="w-max max-w-[15rem] rounded-xl border border-border bg-surface p-3 shadow-xl">
                  <p className="mb-2 text-xs font-semibold text-text-muted">
                    {t('listCard.allSkills')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {remainingSkills.map((skill) => (
                      <span
                        key={skill}
                        className={clsx('rounded-md px-2 py-0.5 text-xs font-medium', SKILL_CHIP_CLASS)}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Downward arrow */}
                <div className="ms-3 h-0 w-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-border" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border-muted pt-3">
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{candidate.email !== '' ? candidate.email : t('listCard.noEmail')}</span>
        </span>
        {candidate.phone !== '' && (
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
            {candidate.phone}
          </span>
        )}
      </div>
    </div>
  );
}
