import type { JSX } from 'react';
import { DocumentTextIcon } from '@/icons';
import { Select } from '@/components/ui/select/Select';
import { useT } from '@/i18n/useT';
import type { MasterDataItem } from '../types/jd.types';

interface JdSectionProps {
  jobTitles: MasterDataItem[];
  seniorities: MasterDataItem[];
  selectedJobTitle: MasterDataItem | null;
  selectedSeniority: MasterDataItem | null;
  onJobTitleChange: (value: MasterDataItem | null) => void;
  onSeniorityChange: (value: MasterDataItem | null) => void;
  disabled?: boolean;
}

export function JdSection({
  jobTitles,
  seniorities,
  selectedJobTitle,
  selectedSeniority,
  onJobTitleChange,
  onSeniorityChange,
  disabled = false,
}: JdSectionProps): JSX.Element {
  const { t } = useT('jd');

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <DocumentTextIcon className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold text-text">{t('sections.jdSection')}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-text-muted">{t('fields.jobTitle')}</label>
          <Select<MasterDataItem>
            value={selectedJobTitle}
            onChange={onJobTitleChange}
            options={jobTitles}
            getOptionKey={(opt) => opt.id}
            renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
            renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
            placeholder={<span className="text-xs text-text-muted">—</span>}
            disabled={disabled}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-muted">{t('fields.seniorityLevel')}</label>
          <Select<MasterDataItem>
            value={selectedSeniority}
            onChange={onSeniorityChange}
            options={seniorities}
            getOptionKey={(opt) => opt.id}
            renderValue={(opt) => <span className="text-xs text-text">{opt.name}</span>}
            renderOption={(opt) => <span className="text-xs">{opt.name}</span>}
            placeholder={<span className="text-xs text-text-muted">—</span>}
            disabled={disabled}
          />
        </div>
      </div>

      {selectedJobTitle != null && selectedSeniority != null && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {t('fields.generatedTitle')}
          </span>
          <span className="text-sm font-semibold text-primary">
            {selectedSeniority.name} {selectedJobTitle.name}
          </span>
        </div>
      )}
    </div>
  );
}
