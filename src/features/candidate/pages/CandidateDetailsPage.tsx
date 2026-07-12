import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { PageContainer } from '@/components/containers/PageContainer';
import { Button } from '@/components/ui/button';
import { CandidateDetailSkeleton } from '@/components/ui/loader';
import { useT } from '@/i18n/useT';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
} from '@/icons';
import { env } from '@/config/env';
import {
  useGetCandidateDetailsQuery,
  useUpdateCandidateScoreMutation,
  useSaveHRFeedbackMutation,
  useGetHRAnswersQuery,
  useSaveHRAnswersMutation,
  useUpdateCandidateInfoMutation,
} from '../api/candidate.api';
import { toastService } from '@/components/ui/toast/toastService';
import type { HRAnswerQuestion } from '../types/candidate.types';
import { useGetMasterDataQuery } from '@/features/jd/api/jd.api';
import { useGetModuleIdQuery } from '@/features/common/api/common.api';
import type { MasterDataItem } from '@/features/jd/types/jd.types';
import type {
  CandidateDetail,
  CandidateDetailScore,
  CandidateDetailScoreGroup,
} from '../types/candidate.types';

// ── Utilities ─────────────────────────────────────────────────────────────────

type DetailTab = 'overview' | 'experience' | 'education' | 'skills' | 'resume' | 'score' | 'hrQuestions';

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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarClass(name: string): string {
  return AVATAR_PALETTE[(name.charCodeAt(0) ?? 65) % AVATAR_PALETTE.length];
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

function getScoreBarClass(score: number): string {
  if (score >= 75) return 'bg-success';
  if (score >= 50) return 'bg-warning';
  return 'bg-error';
}

const fmt = (n: number | undefined | null): number => parseFloat((n ?? 0).toFixed(2));

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({ detail, t }: { detail: CandidateDetail; t: (key: string) => string }): JSX.Element {
  const avatarClass = getAvatarClass(detail.personal.fullName);
  const initials = getInitials(detail.personal.fullName);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={clsx('flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold', avatarClass)}>
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-text">{detail.personal.fullName}</p>
          <p className="mt-0.5 text-xs text-text-muted">{detail.professional.currentJobTitle}</p>
          {detail.professional.currentCompany !== '' && (
            <div className="mt-1 flex items-center justify-center gap-1">
              <BuildingOfficeIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              <span className="text-xs text-text-muted">{detail.professional.currentCompany}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 border-t border-border-muted pt-4">
        {detail.personal.location !== '' && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <MapPinIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{detail.personal.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <BriefcaseIcon className="h-4 w-4 shrink-0" />
          <span>{detail.professional.totalExperience} {t('details.profile.yearsExp')}</span>
        </div>
        {detail.personal.email !== '' && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <EnvelopeIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{detail.personal.email}</span>
          </div>
        )}
        {detail.personal.phone !== '' && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <PhoneIcon className="h-4 w-4 shrink-0" />
            <span>{detail.personal.phone}</span>
          </div>
        )}
        {detail.personal.linkedinUrl != null && (
          <a
            href={detail.personal.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary hover:underline"
          >
            <GlobeAltIcon className="h-4 w-4 shrink-0" />
            <span>{t('details.profile.linkedin')}</span>
          </a>
        )}
        {detail.personal.githubUrl != null && (
          <a
            href={detail.personal.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary hover:underline"
          >
            <GlobeAltIcon className="h-4 w-4 shrink-0" />
            <span>{t('details.profile.github')}</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ── AI Match Card ─────────────────────────────────────────────────────────────

interface AIMatchCardProps {
  score: CandidateDetailScore | null;
  isCalculating: boolean;
  canCalculate: boolean;
  onCalculate: () => void;
  t: (key: string) => string;
}

function AIMatchCard({ score, isCalculating, canCalculate, onCalculate, t }: AIMatchCardProps): JSX.Element {
  if (score == null) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-surface p-5 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
          <SparklesIcon className="h-6 w-6 text-text-muted" />
        </div>
        <div>
          <p className="text-xs font-semibold text-text">{t('details.aiMatch.notAvailable')}</p>
          <p className="mt-1 text-xs text-text-muted">{t('details.aiMatch.notAvailableDesc')}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          disabled={!canCalculate || isCalculating}
          leadingIcon={<SparklesIcon className="h-4 w-4" />}
          onClick={onCalculate}
        >
          {isCalculating ? t('details.aiMatch.calculating') : t('details.aiMatch.calculateScore')}
        </Button>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 15.9;
  const dash = (score.finalScore / 100) * circumference;
  const colorClass = getScoreColorClass(score.finalScore);
  const strokeClass = getScoreStrokeClass(score.finalScore);
  const verdictStyle = VERDICT_STYLES[score.verdict] ?? 'bg-surface-muted text-text-muted';

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-text">{t('details.aiMatch.title')}</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="relative h-20 w-20">
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
          <span className={clsx('absolute inset-0 flex items-center justify-center text-base font-bold', colorClass)}>
            {fmt(score.finalScore)}%
          </span>
        </div>

        <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', verdictStyle)}>
          {score.verdict}
        </span>

        <div className="mt-1 grid w-full grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-muted p-2.5 text-center">
            <p className="text-xs text-text-muted">{t('details.aiMatch.baseScore')}</p>
            <p className="mt-0.5 text-sm font-bold text-text">{fmt(score.baseScore)}%</p>
          </div>
          <div className="rounded-lg bg-surface-muted p-2.5 text-center">
            <p className="text-xs text-text-muted">{t('details.aiMatch.finalScore')}</p>
            <p className="mt-0.5 text-sm font-bold text-text">{fmt(score.finalScore)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-0.5 text-xs text-text">{value}</p>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]*$/;

function EditableField({ label, value, onChange, error, type = 'text', placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}): JSX.Element {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder={placeholder}
        className={clsx(
          'w-full rounded-md border bg-transparent px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary',
          error != null && error !== '' ? 'border-error' : 'border-border',
        )}
      />
      {error != null && error !== '' && (
        <p className="mt-0.5 text-xs text-error">{error}</p>
      )}
    </div>
  );
}

function OverviewTab({ detail, candidateId, onUpdated, t }: {
  detail: CandidateDetail;
  candidateId: number;
  onUpdated: () => void;
  t: (key: string) => string;
}): JSX.Element {
  const noValue = t('details.overview.noValue');
  const [updateCandidateInfo, { isLoading: isUpdating }] = useUpdateCandidateInfoMutation();

  const [email, setEmail] = useState(detail.personal.email);
  const [phone, setPhone] = useState(detail.personal.phone);
  const [experience, setExperience] = useState(String(detail.professional.totalExperience));
  const [errors, setErrors] = useState<{ email?: string; phone?: string; experience?: string }>({});

  // Sync when detail refreshes
  useEffect(() => {
    setEmail(detail.personal.email);
    setPhone(detail.personal.phone);
    setExperience(String(detail.professional.totalExperience));
    setErrors({});
  }, [detail]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (email.trim() !== '' && !EMAIL_RE.test(email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (!PHONE_RE.test(phone)) {
      next.phone = 'Phone number must contain only digits, spaces, +, -, or ().';
    }
    if (experience.trim() !== '' && (isNaN(Number(experience)) || Number(experience) < 0)) {
      next.experience = 'Please enter a valid number.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleUpdate(): Promise<void> {
    if (!validate()) return;
    await updateCandidateInfo({
      candidate_id: candidateId,
      email: email.trim(),
      phone: phone.trim(),
      total_experience: Number(experience) || 0,
    }).unwrap();
    onUpdated();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Personal info */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t('details.overview.personalInfo')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EditableField
            label={t('details.overview.email')}
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (v.trim() !== '' && !EMAIL_RE.test(v.trim())) {
                setErrors((prev) => ({ ...prev, email: 'Email not valid.' }));
              } else {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={errors.email}
            placeholder="Enter email"
          />
          <EditableField
            label={t('details.overview.phone')}
            value={phone}
            onChange={(v) => {
              // Block non-phone characters as you type
              if (PHONE_RE.test(v)) {
                setPhone(v);
                setErrors((prev) => ({ ...prev, phone: undefined }));
              } else {
                setErrors((prev) => ({ ...prev, phone: 'Phone number must contain only digits, spaces, +, -, or ().' }));
              }
            }}
            error={errors.phone}
            placeholder="Enter phone"
          />
          <InfoField label={t('details.overview.location')} value={detail.personal.location !== '' ? detail.personal.location : noValue} />
          <InfoField label={t('details.overview.linkedin')} value={detail.personal.linkedinUrl ?? noValue} />
          <InfoField label={t('details.overview.github')} value={detail.personal.githubUrl ?? noValue} />
          {detail.personal.portfolioLinks.length > 0 && (
            <InfoField label={t('details.overview.portfolio')} value={detail.personal.portfolioLinks.join(', ')} />
          )}
        </div>
      </div>

      {/* Professional info */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t('details.overview.professionalInfo')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoField label={t('details.overview.currentRole')} value={detail.professional.currentJobTitle !== '' ? detail.professional.currentJobTitle : noValue} />
          <InfoField label={t('details.overview.currentCompany')} value={detail.professional.currentCompany !== '' ? detail.professional.currentCompany : noValue} />
          <EditableField
            label={t('details.overview.experience')}
            value={experience}
            onChange={setExperience}
            error={errors.experience}
            placeholder="Years of experience"
          />
        </div>
      </div>

      {/* Update button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          disabled={isUpdating}
          onClick={() => { void handleUpdate(); }}
        >
          {isUpdating ? 'Updating…' : 'Update Details'}
        </Button>
      </div>
    </div>
  );
}

// ── Experience Tab ────────────────────────────────────────────────────────────

function ExperienceTab({ detail, t }: { detail: CandidateDetail; t: (key: string) => string }): JSX.Element {
  if (detail.experience.length === 0) {
    return <EmptyTabState message={t('details.experience.noExperience')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {detail.experience.map((exp, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BriefcaseIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{exp.jobTitle}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <BuildingOfficeIcon className="h-3.5 w-3.5 text-text-muted" />
                  <span className="text-xs text-text-muted">{exp.companyName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <ClockIcon className="h-3.5 w-3.5 shrink-0" />
              <span>
                {exp.startDate ?? t('details.experience.present')}
                {' – '}
                {exp.endDate ?? t('details.experience.present')}
              </span>
            </div>
          </div>

          {exp.responsibilities.length > 0 && (
            <div className="mt-4 border-t border-border-muted pt-4">
              <p className="mb-2 text-xs font-medium text-text-muted">{t('details.experience.responsibilities')}</p>
              <ul className="flex flex-col gap-1.5">
                {exp.responsibilities.map((resp, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-text">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Education Tab ─────────────────────────────────────────────────────────────

function EducationTab({ detail, t }: { detail: CandidateDetail; t: (key: string) => string }): JSX.Element {
  if (detail.education.length === 0) {
    return <EmptyTabState message={t('details.education.noEducation')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {detail.education.map((edu, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
              <AcademicCapIcon className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{edu.degree}</p>
              {edu.fieldOfStudy !== '' && (
                <p className="mt-0.5 text-xs text-text-muted">{edu.fieldOfStudy}</p>
              )}
              <p className="mt-1 text-xs text-text-muted">{edu.institutionName}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Skills Tab ────────────────────────────────────────────────────────────────

function SkillGroup({ title, skills, t }: { title: string; skills: string[]; t: (key: string) => string }): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      {skills.length === 0 ? (
        <p className="text-xs text-text-muted">{t('details.skills.noSkills')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text-muted"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillsTab({ detail, t }: { detail: CandidateDetail; t: (key: string) => string }): JSX.Element {
  return (
    <div className="flex flex-col gap-5">
      <SkillGroup title={t('details.skills.technical')} skills={detail.skills.technical} t={t} />
      <SkillGroup title={t('details.skills.core')} skills={detail.skills.core} t={t} />
      <SkillGroup title={t('details.skills.soft')} skills={detail.skills.soft} t={t} />
    </div>
  );
}

// ── Resume Tab ────────────────────────────────────────────────────────────────

async function downloadResume(candidateId: number, fileName: string): Promise<void> {
  const url = `${env.API_BASE_URL}/candidate/previewResume/${candidateId}`;
  const response = await fetch(url, { credentials: 'include' });
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName !== '' ? fileName : 'resume.pdf';
  a.click();
  URL.revokeObjectURL(blobUrl);
}

function ResumeTab({ detail, t }: { detail: CandidateDetail; t: (key: string) => string }): JSX.Element {
  if (detail.resume.fileName === '') {
    return <EmptyTabState message={t('details.resume.noResume')} />;
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <DocumentTextIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text">{detail.resume.fileName}</p>
            <p className="mt-0.5 text-xs text-text-muted">{t('details.resume.pdfDocument')}</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
          onClick={() => { void downloadResume(detail.candidateId, detail.resume.fileName); }}
        >
          {t('details.resume.download')}
        </Button>
      </div>
    </div>
  );
}

// ── AI Score Breakdown Tab ────────────────────────────────────────────────────

type SkillChipVariant = 'success' | 'error' | 'neutral' | 'muted';

const CHIP_CLASS: Record<SkillChipVariant, string> = {
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
  neutral: 'bg-primary/10 text-primary',
  muted: 'bg-surface-muted text-text-muted',
};

function SkillChipList({ title, skills, variant }: {
  title: string;
  skills: string[];
  variant: SkillChipVariant;
}): JSX.Element | null {
  if (skills.length === 0) return null;

  const isPresent = variant === 'success' || variant === 'neutral';

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        {isPresent
          ? <CheckCircleIcon className={clsx('h-3.5 w-3.5', variant === 'success' ? 'text-success' : 'text-primary')} />
          : <XCircleIcon className={clsx('h-3.5 w-3.5', variant === 'error' ? 'text-error' : 'text-text-muted')} />
        }
        <p className="text-xs font-medium text-text-muted">{title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span key={skill} className={clsx('rounded-md px-2 py-0.5 text-xs font-medium', CHIP_CLASS[variant])}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScoreGroupCard({ group, assessment, comment, error, feedbackStatuses, onAssessmentChange, onCommentChange, t }: {
  group: CandidateDetailScoreGroup;
  assessment: string;
  comment: string;
  error: string;
  feedbackStatuses: MasterDataItem[];
  onAssessmentChange: (groupKey: string, value: string) => void;
  onCommentChange: (groupKey: string, value: string) => void;
  t: (key: string) => string;
}): JSX.Element {
  const groupScorePct = group.groupScore * 100;
  const barClass = getScoreBarClass(groupScorePct);
  const colorClass = getScoreColorClass(groupScorePct);

  const hasSkills =
    group.presentRequired.length > 0 ||
    group.missingRequired.length > 0 ||
    group.optionalPresent.length > 0 ||
    group.optionalMissing.length > 0;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="p-4">
        <div className="grid grid-cols-[minmax(0,1.5fr)_3.5rem_3.5rem_4.5rem_9rem_minmax(0,1fr)_1.5rem] items-start gap-x-2">
          <p className="truncate pt-0.5 text-xs font-semibold text-text">
            {group.groupName}
          </p>
          <p className="pt-0.5 text-center text-xs font-medium text-text">{group.weight}%</p>
          <p className={clsx('pt-0.5 text-center text-xs font-semibold', colorClass)}>{fmt(groupScorePct)}%</p>
          <p className="pt-0.5 text-center text-xs font-medium text-text">{fmt(group.finalContribution)}</p>

          <select
            value={assessment}
            onChange={(e) => { onAssessmentChange(group.groupKey, e.target.value); }}
            className="w-full rounded-md border border-border bg-surface py-1 ps-2 pe-1 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('details.score.selectAssessment')}</option>
            {feedbackStatuses.map((s) => (
              <option key={s.id} value={s.id.toString()}>{s.name}</option>
            ))}
          </select>

          <div>
            <textarea
              value={comment}
              rows={2}
              onChange={(e) => { onCommentChange(group.groupKey, e.target.value); }}
              placeholder={t('details.score.feedbackPlaceholder')}
              className={clsx(
                'w-full resize-none rounded-md border bg-surface px-2 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary',
                error !== '' ? 'border-error' : 'border-border',
              )}
            />
            {error !== '' && (
              <p className="mt-0.5 text-xs text-error">{error}</p>
            )}
          </div>

          {hasSkills ? (
            <Button
              variant="unstyled"
              className="mt-0.5 flex items-center justify-center rounded p-0.5 text-text-muted hover:bg-surface-muted hover:text-text"
              onClick={() => { setIsExpanded((v) => !v); }}
            >
              {isExpanded
                ? <ChevronUpIcon className="h-4 w-4" />
                : <ChevronDownIcon className="h-4 w-4" />
              }
            </Button>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', barClass)}
            style={{ width: `${groupScorePct}%` }}
          />
        </div>
      </div>

      {hasSkills && isExpanded && (
        <div className="flex flex-col gap-3 border-t border-border-muted px-4 pb-4 pt-3">
          <SkillChipList title={t('details.score.requiredPresent')} skills={group.presentRequired} variant="success" />
          <SkillChipList title={t('details.score.requiredMissing')} skills={group.missingRequired} variant="error" />
          <SkillChipList title={t('details.score.optionalPresent')} skills={group.optionalPresent} variant="neutral" />
          <SkillChipList title={t('details.score.optionalMissing')} skills={group.optionalMissing} variant="muted" />
        </div>
      )}
    </div>
  );
}

function ScoreBreakdownTab({
  detail,
  t,
  onSaved,
}: {
  detail: CandidateDetail;
  t: (key: string) => string;
  onSaved: () => void;
}): JSX.Element {
  const { data: masterData } = useGetMasterDataQuery();
  const feedbackStatuses = masterData?.feedbackStatuses ?? [];
  const [saveHRFeedback, { isLoading: isSaving }] = useSaveHRFeedbackMutation();

  const [assessments, setAssessments] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-populate form from saved hr_feedback whenever detail refreshes
  useEffect(() => {
    const initAssessments: Record<string, string> = {};
    const initComments: Record<string, string> = {};
    detail.score?.groupBreakdown.forEach((g) => {
      if (g.hrFeedback != null) {
        initAssessments[g.groupKey] = String(g.hrFeedback.feedbackTypeId);
        initComments[g.groupKey] = g.hrFeedback.userFeedback;
      }
    });
    setAssessments(initAssessments);
    setComments(initComments);
    setErrors({});
  }, [detail.score]);

  function handleAssessmentChange(groupKey: string, value: string): void {
    setAssessments((prev) => ({ ...prev, [groupKey]: value }));
    const status = feedbackStatuses.find((s) => s.id.toString() === value);
    const name = status?.name.toLowerCase().trim() ?? '';
    const needsComment = name === 'partial' || name === 'no' || name.startsWith('partial') || name.startsWith('no ');
    const currentComment = comments[groupKey] ?? '';
    if (needsComment && currentComment.trim() === '') {
      setErrors((prev) => ({ ...prev, [groupKey]: t('details.score.feedbackRequired') }));
    } else {
      setErrors((prev) => { const next = { ...prev }; delete next[groupKey]; return next; });
    }
  }

  function handleCommentChange(groupKey: string, value: string): void {
    setComments((prev) => ({ ...prev, [groupKey]: value }));
    if (value.trim() !== '') {
      setErrors((prev) => { const next = { ...prev }; delete next[groupKey]; return next; });
    }
  }

  function requiresComment(assessmentId: string): boolean {
    const status = feedbackStatuses.find((s) => s.id.toString() === assessmentId);
    if (status == null) return false;
    const name = status.name.toLowerCase().trim();
    return name === 'partial' || name === 'no' || name.startsWith('partial') || name.startsWith('no ');
  }

  async function handleSave(): Promise<void> {
    if (detail.score == null) return;

    // Validate: groups with assessments that need a comment must have one
    const newErrors: Record<string, string> = {};
    detail.score.groupBreakdown.forEach((group) => {
      const assessment = assessments[group.groupKey] ?? '';
      const comment = comments[group.groupKey] ?? '';
      if (assessment !== '' && requiresComment(assessment) && comment.trim() === '') {
        newErrors[group.groupKey] = t('details.score.feedbackRequired');
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Only send groups where the user picked an assessment
    const feedbacks = detail.score.groupBreakdown
      .filter((group) => (assessments[group.groupKey] ?? '') !== '')
      .map((group) => ({
        group_score_id: group.groupScoreId,
        feedback_type_id: Number(assessments[group.groupKey]),
        user_feedback: comments[group.groupKey] ?? '',
      }));

    if (feedbacks.length === 0) return;

    await saveHRFeedback({ candidate_id: detail.candidateId, feedbacks }).unwrap();
    onSaved();
  }

  if (detail.score == null) {
    return <EmptyTabState message={t('details.score.notScored')} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1.5fr)_3.5rem_3.5rem_4.5rem_9rem_minmax(0,1fr)_1.5rem] gap-x-2 rounded-lg bg-surface-muted px-4 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {t('details.score.parameter')}
        </p>
        <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {t('details.score.weight')}
        </p>
        <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {t('details.score.candidateScore')}
        </p>
        <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {t('details.score.contribution')}
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {t('details.score.yourAssessment')}
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {t('details.score.feedbackComments')}
        </p>
        <div />
      </div>

      {detail.score.groupBreakdown.map((group) => (
        <ScoreGroupCard
          key={group.groupKey}
          group={group}
          assessment={assessments[group.groupKey] ?? ''}
          comment={comments[group.groupKey] ?? ''}
          error={errors[group.groupKey] ?? ''}
          feedbackStatuses={feedbackStatuses}
          onAssessmentChange={handleAssessmentChange}
          onCommentChange={handleCommentChange}
          t={t}
        />
      ))}

      <div className="flex justify-end pt-1">
        <Button
          variant="primary"
          size="sm"
          disabled={isSaving}
          onClick={() => { void handleSave(); }}
        >
          {isSaving ? t('actions.saving') : t('details.score.saveFeedback')}
        </Button>
      </div>
    </div>
  );
}

// ── HR Questions Tab ──────────────────────────────────────────────────────────

// key → string (textbox/textarea/single_select) or string[] (multi_select)
type HRFormState = Record<string, string | string[]>;

function QuestionRow({ question, formState, onChange }: {
  question: HRAnswerQuestion;
  formState: HRFormState;
  onChange: (key: string, value: string | string[]) => void;
}): JSX.Element {
  const inputCls = 'w-full rounded-md border border-border bg-transparent px-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary';
  const val = formState[question.questionKey];

  return (
    <div className="grid grid-cols-[minmax(160px,220px)_1fr] items-start gap-4">
      <label className="pt-1.5 text-sm font-medium text-text leading-snug">
        {question.questionText}
        {question.isRequired && <span className="ms-0.5 text-error">*</span>}
      </label>

      <div>
        {question.inputType === 'textbox' && (
          <input
            type="text"
            value={(val as string) ?? ''}
            onChange={(e) => { onChange(question.questionKey, e.target.value); }}
            className={inputCls}
          />
        )}

        {question.inputType === 'textarea' && (
          <textarea
            rows={3}
            value={(val as string) ?? ''}
            onChange={(e) => { onChange(question.questionKey, e.target.value); }}
            placeholder="Enter your comments…"
            className={`${inputCls} resize-none`}
          />
        )}

        {question.inputType === 'single_select' && (
          <select
            value={(val as string) ?? ''}
            onChange={(e) => { onChange(question.questionKey, e.target.value); }}
            className="w-full rounded-md border border-border bg-surface py-1.5 ps-3 pe-8 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select…</option>
            {question.options.map((o) => (
              <option key={o.optionId} value={o.optionValue}>{o.optionLabel}</option>
            ))}
          </select>
        )}

        {question.inputType === 'multi_select' && (
          <div className="flex flex-wrap gap-3 pt-1">
            {question.options.map((o) => {
              const selected = (val as string[] | undefined) ?? [];
              return (
                <label key={o.optionId} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.optionValue)}
                    onChange={(e) => {
                      const current = (val as string[] | undefined) ?? [];
                      const next = e.target.checked
                        ? [...current, o.optionValue]
                        : current.filter((v) => v !== o.optionValue);
                      onChange(question.questionKey, next);
                    }}
                    className="h-4 w-4 cursor-pointer rounded accent-[var(--color-primary)]"
                  />
                  <span className="text-sm text-text">{o.optionLabel}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function HRQuestionsTab({ candidateId }: { candidateId: number }): JSX.Element {
  const { data: questions = [], isLoading, refetch } = useGetHRAnswersQuery(candidateId, {
    refetchOnMountOrArgChange: true,
  });
  const [saveHRAnswers, { isLoading: isSaving }] = useSaveHRAnswersMutation();
  const [formState, setFormState] = useState<HRFormState>({});

  // Pre-fill from API answers whenever data loads
  useEffect(() => {
    if (questions.length === 0) return;
    const initial: HRFormState = {};
    questions.forEach((q) => {
      if (q.answerText === null) return;
      if (q.inputType === 'multi_select') {
        try { initial[q.questionKey] = JSON.parse(q.answerText) as string[]; }
        catch { initial[q.questionKey] = []; }
      } else {
        initial[q.questionKey] = q.answerText;
      }
    });
    setFormState(initial);
  }, [questions]);

  function handleChange(key: string, value: string | string[]): void {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(): Promise<void> {
    const answers = questions
      .filter((q) => {
        const val = formState[q.questionKey];
        if (val === undefined) return false;
        if (Array.isArray(val)) return val.length > 0;
        return (val as string).trim() !== '';
      })
      .map((q) => {
        const val = formState[q.questionKey];
        const answerText = Array.isArray(val)
          ? JSON.stringify(val)
          : (val as string);
        return { question_key: q.questionKey, answer_text: answerText };
      });

    if (answers.length === 0) {
      toastService.info('Please answer at least one question before saving.');
      return;
    }

    await saveHRAnswers({ candidate_id: candidateId, answers }).unwrap();
    void refetch();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return <EmptyTabState message="No HR questions configured." />;
  }

  const sorted = [...questions].sort((a, b) => a.displayOrder - b.displayOrder);

  // Separate the comment question (last by display_order) from the rest
  const commentQuestion = sorted.findLast((q) => q.questionKey === 'comment');
  const mainQuestions = sorted.filter((q) => q.questionKey !== 'comment');

  const ungrouped = mainQuestions.filter((q) => q.groupId === null);
  const groupMap = new Map<number, { groupName: string; questions: HRAnswerQuestion[] }>();
  mainQuestions
    .filter((q) => q.groupId !== null)
    .forEach((q) => {
      const gid = q.groupId!;
      if (!groupMap.has(gid)) groupMap.set(gid, { groupName: q.groupName!, questions: [] });
      groupMap.get(gid)!.questions.push(q);
    });

  return (
    <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 160px)' }}>
      {/* Scrollable questions area */}
      <div className="flex flex-col gap-5 overflow-y-auto pe-1 pb-2">

        {/* Ungrouped questions */}
        {ungrouped.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-col gap-5 divide-y divide-border-muted">
              {ungrouped.map((q, i) => (
                <div key={q.questionId} className={i > 0 ? 'pt-5' : ''}>
                  <QuestionRow question={q} formState={formState} onChange={handleChange} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grouped sections */}
        {Array.from(groupMap.values()).map((group) => (
          <div key={group.groupName} className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {group.groupName}
            </h3>
            <div className="flex flex-col gap-5 divide-y divide-border-muted">
              {group.questions.map((q, i) => (
                <div key={q.questionId} className={i > 0 ? 'pt-5' : ''}>
                  <QuestionRow question={q} formState={formState} onChange={handleChange} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Comment — always last */}
        {commentQuestion != null && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <QuestionRow question={commentQuestion} formState={formState} onChange={handleChange} />
          </div>
        )}

      </div>

      {/* Save — pinned at bottom */}
      <div className="mt-2 flex shrink-0 justify-end border-t border-border pt-4">
        <Button
          variant="primary"
          size="sm"
          disabled={isSaving}
          onClick={() => { void handleSave(); }}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyTabState({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-surface">
      <p className="text-xs text-text-muted">{message}</p>
    </div>
  );
}

// ── Score Summary Card ────────────────────────────────────────────────────────

function ScoreSummaryCard({ score, t }: { score: CandidateDetailScore; t: (key: string) => string }): JSX.Element {
  const circumference = 2 * Math.PI * 15.9;
  const dash = (score.finalScore / 100) * circumference;
  const colorClass = getScoreColorClass(score.finalScore);
  const strokeClass = getScoreStrokeClass(score.finalScore);
  const verdictStyle = VERDICT_STYLES[score.verdict] ?? 'bg-surface-muted text-text-muted';

  return (
    <div className="mb-4 rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <ChartBarIcon className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-text">{t('details.score.breakdownTitle')}</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Overall ring */}
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="relative h-20 w-20">
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
            <span className={clsx('absolute inset-0 flex items-center justify-center text-base font-bold', colorClass)}>
              {fmt(score.finalScore)}%
</span>
          </div>
          <p className="text-xs text-text-muted">{t('details.score.overall')}</p>
        </div>

        {/* Parameter rows */}
        <div className="flex flex-1 flex-col gap-2.5">
          {score.groupBreakdown.map((group) => {
            const pct = group.groupScore * 100;
            const barClass = getScoreBarClass(pct);
            const scoreColor = getScoreColorClass(pct);
            return (
              <div key={group.groupKey} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3">
                <p className="truncate text-xs text-text-muted">
                  {group.groupName}
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-500', barClass)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className={clsx('text-end text-xs font-semibold', scoreColor)}>{fmt(pct)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border-t border-border-muted pt-3">
        <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', verdictStyle)}>
          {score.verdict}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function CandidateDetailsPage(): JSX.Element {
  const { t } = useT('candidate');
  const navigate = useNavigate();
  const location = useLocation();
  const { candidateId: candidateIdParam } = useParams<{ candidateId: string }>();
  const candidateId = Number(candidateIdParam);

  const stateJdId = (location.state as { jdId?: number } | null)?.jdId ?? null;

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [updateCandidateScore, { isLoading: isCalculating }] = useUpdateCandidateScoreMutation();

  const { data: _moduleId } = useGetModuleIdQuery('CAND_MGT');
  const { data: detail, isLoading, isError, refetch } = useGetCandidateDetailsQuery(candidateId, {
    skip: isNaN(candidateId),
  });

  const jdId = detail?.jdId ?? stateJdId;

  async function handleCalculateScore(): Promise<void> {
    if (jdId == null) return;
    try {
      await updateCandidateScore({ jd_id: jdId, candidate_ids: [candidateId] }).unwrap();
      void refetch();
    } catch {
      // errors handled by apiToastMiddleware
    }
  }

  if (isNaN(candidateId)) {
    return (
      <PageContainer>
        <p className="text-xs text-error">{t('details.errors.invalidId')}</p>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <CandidateDetailSkeleton />
      </PageContainer>
    );
  }

  if (isError || detail == null) {
    return (
      <PageContainer>
        <p className="text-xs text-error">{t('details.errors.fetchFailed')}</p>
      </PageContainer>
    );
  }

  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: 'overview',     label: t('details.tabs.overview') },
    { key: 'hrQuestions',  label: t('details.tabs.hrQuestions') },
    { key: 'experience',   label: t('details.tabs.experience') },
    { key: 'education',    label: t('details.tabs.education') },
    { key: 'skills',       label: t('details.tabs.skills') },
    { key: 'resume',       label: t('details.tabs.resume') },
    { key: 'score',        label: t('details.tabs.aiScore') },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-text">{detail.personal.fullName}</p>
            <p className="text-xs text-text-muted">
              {detail.professional.currentJobTitle}
              {detail.professional.currentCompany !== '' && ` · ${detail.professional.currentCompany}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              leadingIcon={<ArrowDownTrayIcon className="h-3.5 w-3.5" />}
              onClick={() => { void downloadResume(detail.candidateId, detail.resume.fileName); }}
            >
              {t('details.header.downloadResume')}
            </Button>
            <Button
              variant="secondary"
              size="xs"
              leadingIcon={<ArrowLeftIcon className="h-3.5 w-3.5" />}
              onClick={() => { void navigate('/candidate'); }}
            >
              {t('details.header.backToCandidates')}
            </Button>
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

          {/* Left sidebar */}
          <div className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
            <ProfileCard detail={detail} t={t} />
            <AIMatchCard
              score={detail.score}
              isCalculating={isCalculating}
              canCalculate={jdId != null}
              onCalculate={() => { void handleCalculateScore(); }}
              t={t}
            />
          </div>

          {/* Right content */}
          <div className="min-w-0 flex-1">
            {detail.score != null && <ScoreSummaryCard score={detail.score} t={t} />}

            {/* Tab bar */}
            <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.key}
                  variant="unstyled"
                  className={clsx(
                    'shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    activeTab === tab.key
                      ? 'border border-primary bg-primary text-white'
                      : 'border border-transparent text-text-muted hover:bg-surface-muted hover:text-text'
                  )}
                  onClick={() => { setActiveTab(tab.key); }}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && <OverviewTab detail={detail} candidateId={candidateId} onUpdated={refetch} t={t} />}
            {activeTab === 'experience' && <ExperienceTab detail={detail} t={t} />}
            {activeTab === 'education' && <EducationTab detail={detail} t={t} />}
            {activeTab === 'skills' && <SkillsTab detail={detail} t={t} />}
            {activeTab === 'resume' && <ResumeTab detail={detail} t={t} />}
            {activeTab === 'score' && <ScoreBreakdownTab detail={detail} t={t} onSaved={refetch} />}
            {activeTab === 'hrQuestions' && <HRQuestionsTab candidateId={candidateId} />}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
