import type { JSX } from 'react';
import { useT } from '@/i18n/useT';
import { AutocompleteSelect } from '@/components/ui/autocompleteSelect';
import type { AutocompleteOption } from '@/components/ui/autocompleteSelect';
import { InformationCircleIcon } from '@/icons';

interface JdSelectionPanelProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  showHint?: boolean;
}

export function JdSelectionPanel({ value, onChange, options, showHint = false }: JdSelectionPanelProps): JSX.Element {
  const { t } = useT('candidate');

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-muted">
        {t('jdSelection.label')}
        <span className="ms-0.5 text-error">*</span>
      </label>
      <AutocompleteSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder={t('jdSelection.placeholder')}
        searchPlaceholder={t('jdSelection.searchPlaceholder')}
        noResultsText={t('jdSelection.noResults')}
      />
      {showHint && (
        <p className="flex items-center gap-1 text-xs text-warning">
          <InformationCircleIcon className="h-3.5 w-3.5 shrink-0" />
          {t('jdSelection.hint')}
        </p>
      )}
    </div>
  );
}
