import type { JSX } from 'react';
import { useT } from '@/i18n/useT';
import type { FieldValues, ExperienceYears } from '../types/jd.types';

interface JdDetailsProps {
  fieldValues: FieldValues;
  jobTitle: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatExpYears(exp: ExperienceYears | null | undefined): string | null {
  if (exp == null) return null;
  if (exp.min != null && exp.max != null) return `${exp.min}–${exp.max} years`;
  if (exp.min != null) return `${exp.min}+ years`;
  if (exp.max != null) return `Up to ${exp.max} years`;
  return null;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }): JSX.Element {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-text-muted">
        {title}
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

function TagChip({ label }: { label: string }): JSX.Element {
  return (
    <span className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs text-text">
      {label}
    </span>
  );
}

function SkillChip({ label }: { label: string }): JSX.Element {
  return (
    <span className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-primary">
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function JdDetails({ fieldValues, jobTitle }: JdDetailsProps): JSX.Element {
  const { t } = useT('jd');

  const expLabel = formatExpYears(fieldValues.experience_years);

  const headerTags: string[] = [
    fieldValues.work_model != null ? capitalize(fieldValues.work_model) : null,
    expLabel,
    fieldValues.seniority_level != null ? capitalize(fieldValues.seniority_level) : null,
    fieldValues.employment_type != null ? capitalize(fieldValues.employment_type) : null,
  ].filter((v): v is string => v != null);

  const hasResponsibilities =
    fieldValues.core_responsibilities != null && fieldValues.core_responsibilities.length > 0;
  const hasRequiredSkills =
    fieldValues.required_skills != null && fieldValues.required_skills.length > 0;
  const hasPreferredSkills =
    fieldValues.preferred_skills != null && fieldValues.preferred_skills.length > 0;
  const hasAdditionalNotes =
    fieldValues.final_additional_info != null &&
    fieldValues.final_additional_info.trim() !== '' &&
    fieldValues.final_additional_info.toLowerCase() !== 'no';

  return (
    <div className="rounded-xl border border-border bg-surface p-6">

      {/* Job title */}
      <h2 className="mb-3 text-lg font-bold text-text">
        {fieldValues.role_title ?? jobTitle}
      </h2>

      {/* Header tags */}
      {headerTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {headerTags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      )}

      {/* Sub-info row */}
      {(fieldValues.seniority_level != null || fieldValues.department != null) && (
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1">
          {fieldValues.seniority_level != null && (
            <span className="text-xs text-text-muted">{capitalize(fieldValues.seniority_level)}</span>
          )}
          {fieldValues.department != null && (
            <>
              <span className="text-text-muted">·</span>
              <span className="text-xs text-text-muted">{fieldValues.department}</span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6">

        {/* Responsibilities */}
        {hasResponsibilities && (
          <div>
            <SectionHeader title={t('view.sections.responsibilities')} />
            <ul className="flex flex-col gap-1 ps-4">
              {fieldValues.core_responsibilities!.map((item, i) => (
                <li key={i} className="list-disc text-xs text-text">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Skills */}
        {hasRequiredSkills && (
          <div>
            <SectionHeader title={t('view.sections.requiredSkills')} />
            <div className="flex flex-wrap gap-2">
              {fieldValues.required_skills!.map((skill) => (
                <SkillChip key={skill} label={skill} />
              ))}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {hasPreferredSkills && (
          <div>
            <SectionHeader title={t('view.sections.preferredSkills')} />
            <div className="flex flex-wrap gap-2">
              {fieldValues.preferred_skills!.map((skill) => (
                <SkillChip key={skill} label={skill} />
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {hasAdditionalNotes && (
          <div>
            <SectionHeader title={t('view.sections.additionalNotes')} />
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="text-xs text-text">{fieldValues.final_additional_info}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
