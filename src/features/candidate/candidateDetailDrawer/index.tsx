import type { JSX, ReactNode } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import {
  XMarkIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
} from '@/icons';
import type { CandidateDrawerData, CandidateEducation, CandidateWorkHistory } from '../types/candidate.types';

interface CandidateDetailDrawerProps {
  data: CandidateDrawerData | null;
  onClose: () => void;
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      {children}
    </div>
  );
}

function EducationItem({ edu, presentLabel }: { edu: CandidateEducation; presentLabel: string }): JSX.Element {
  const period = [edu.startDate, edu.endDate ?? presentLabel].filter(Boolean).join(' – ');
  const title = edu.fieldOfStudy != null && edu.fieldOfStudy !== ''
    ? `${edu.degree} — ${edu.fieldOfStudy}`
    : edu.degree;
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-surface-muted/40 px-3 py-2.5">
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="text-xs text-text-muted">{edu.institution}</p>
      {period !== '' && <p className="text-xs text-text-muted">{period}</p>}
    </div>
  );
}

function WorkHistoryItem({
  job,
  presentLabel,
}: {
  job: CandidateWorkHistory;
  presentLabel: string;
}): JSX.Element {
  const period = [job.startDate, job.endDate ?? presentLabel].filter(Boolean).join(' – ');
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-surface-muted/40 px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text">{job.position}</p>
          <p className="truncate text-xs text-text-muted">{job.company}</p>
        </div>
        {period !== '' && (
          <span className="shrink-0 text-xs text-text-muted">{period}</span>
        )}
      </div>
      {job.location != null && job.location !== '' && (
        <p className="flex items-center gap-1 text-xs text-text-muted">
          <MapPinIcon className="h-3 w-3 shrink-0" />
          {job.location}
        </p>
      )}
      {job.techUsed.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.techUsed.map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-primary-subtle px-1.5 py-0.5 text-xs font-medium text-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      {job.keyResponsibilities.length > 0 && (
        <ul className="ms-3 list-disc space-y-0.5">
          {job.keyResponsibilities.slice(0, 3).map((resp, i) => (
            <li key={i} className="text-xs text-text-muted">
              {resp}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CandidateDetailDrawer({ data, onClose }: CandidateDetailDrawerProps): JSX.Element {
  const { t } = useT('candidate');
  const isOpen = data != null;
  const presentLabel = t('drawer.present');

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('drawer.title')}
        className={clsx(
          'fixed inset-y-0 end-0 z-50 flex w-full flex-col bg-surface shadow-2xl transition-transform duration-300 ease-in-out sm:w-[480px]',
          isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-text">{data?.name ?? ''}</h2>
            <p className="truncate text-xs text-text-muted">{data?.jobTitle ?? ''}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('drawer.close')}
            className="ms-3 shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        {data != null && (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-6">

              {/* Personal Info */}
              <DrawerSection title={t('drawer.personalInfo')}>
                <div className="flex flex-col gap-2">
                  {data.currentCompany !== '' && (
                    <div className="flex items-center gap-2 text-sm text-text">
                      <BuildingOfficeIcon className="h-4 w-4 shrink-0 text-text-muted" />
                      {data.currentCompany}
                    </div>
                  )}
                  {data.location !== '' && (
                    <div className="flex items-center gap-2 text-sm text-text">
                      <MapPinIcon className="h-4 w-4 shrink-0 text-text-muted" />
                      {data.location}
                    </div>
                  )}
                  {data.email !== '' && (
                    <div className="flex items-center gap-2 text-sm text-text">
                      <EnvelopeIcon className="h-4 w-4 shrink-0 text-text-muted" />
                      {data.email}
                    </div>
                  )}
                  {data.phone !== '' && (
                    <div className="flex items-center gap-2 text-sm text-text">
                      <PhoneIcon className="h-4 w-4 shrink-0 text-text-muted" />
                      {data.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text">
                    <BriefcaseIcon className="h-4 w-4 shrink-0 text-text-muted" />
                    {data.totalExperienceYears} {t('card.years')}
                  </div>
                </div>
              </DrawerSection>

              {/* Skills */}
              {data.allSkills.length > 0 && (
                <DrawerSection title={t('drawer.skills')}>
                  <div className="flex flex-wrap gap-1.5">
                    {data.allSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-primary-subtle px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </DrawerSection>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <DrawerSection title={t('drawer.education')}>
                  <div className="flex flex-col gap-2">
                    {data.education.map((edu, i) => (
                      <EducationItem
                        key={`${edu.institution}-${String(i)}`}
                        edu={edu}
                        presentLabel={presentLabel}
                      />
                    ))}
                  </div>
                </DrawerSection>
              )}

              {/* Work History */}
              {data.workHistory.length > 0 && (
                <DrawerSection title={t('drawer.workHistory')}>
                  <div className="flex flex-col gap-3">
                    {data.workHistory.map((job, i) => (
                      <WorkHistoryItem
                        key={`${job.company}-${String(i)}`}
                        job={job}
                        presentLabel={presentLabel}
                      />
                    ))}
                  </div>
                </DrawerSection>
              )}

              {/* Resume Download */}
              <DrawerSection title={t('drawer.resume')}>
                <a
                  href={data.resumeFilePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-surface-hover"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 text-text-muted" />
                  {t('drawer.downloadResume')}
                </a>
              </DrawerSection>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
