import type { JSX } from 'react';
import { FormField } from '@/components/form/FormField';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/dateTimePicker/DateTimePicker';
import { useT } from '@/i18n/useT';
import { ArrowDownTrayIcon } from '@/icons';
import { useGetAiUsageJdOptionsQuery } from '../api/reports.api';
import type { AiUsageJdOption } from '../types/reports.types';

interface AiUsageFiltersProps {
  fromDate: Date | undefined;
  toDate: Date | undefined;
  selectedJds: AiUsageJdOption[];
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onSelectedJdsChange: (jds: AiUsageJdOption[]) => void;
  onSearch: () => void;
  onClear: () => void;
  onExport: () => void;
  exportDisabled?: boolean;
  exporting?: boolean;
  disabled?: boolean;
}

export function AiUsageFilters({
  fromDate,
  toDate,
  selectedJds,
  onFromDateChange,
  onToDateChange,
  onSelectedJdsChange,
  onSearch,
  onClear,
  onExport,
  exportDisabled = false,
  exporting = false,
  disabled = false,
}: AiUsageFiltersProps): JSX.Element {
  const { t } = useT('reports');
  const { data: jdOptions } = useGetAiUsageJdOptionsQuery();

  return (
    <div className="flex flex-wrap items-end gap-3">

      {/* From date */}
      <div className="w-full sm:w-56">
        <FormField label={t('filters.fromDate')}>
          <DateTimePicker
            mode="date"
            size="small"
            value={fromDate}
            onChange={onFromDateChange}
            maxDate={toDate}
            placeholder={t('filters.selectDate')}
            showClearButton={fromDate != null}
          />
        </FormField>
      </div>

      {/* To date */}
      <div className="w-full sm:w-56">
        <FormField label={t('filters.toDate')}>
          <DateTimePicker
            mode="date"
            size="small"
            value={toDate}
            onChange={onToDateChange}
            minDate={fromDate}
            placeholder={t('filters.selectDate')}
            showClearButton={toDate != null}
          />
        </FormField>
      </div>

      {/* JD name — multi-select, empty = all JDs */}
      <div className="w-full sm:w-56">
        <FormField label={t('filters.jdName')}>
          <Select<AiUsageJdOption>
            multiple
            value={selectedJds}
            onChange={onSelectedJdsChange}
            options={jdOptions ?? []}
            getOptionKey={(opt) => opt.jdId}
            renderValue={(sel) => (
              <span className="text-xs text-text">
                {sel.length === 1 ? sel[0].label : t('filters.jdsSelected', { count: sel.length })}
              </span>
            )}
            renderOption={(opt) => <span className="text-xs">{opt.label}</span>}
            placeholder={<span className="text-xs text-text-muted">{t('filters.allJds')}</span>}
          />
        </FormField>
      </div>

      {/* Search & Clear buttons */}
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={onSearch} disabled={disabled}>
          {t('actions.search')}
        </Button>
        <Button variant="secondary" size="sm" onClick={onClear} disabled={disabled}>
          {t('actions.clearFilters')}
        </Button>
        {/* Exports the currently applied filters (all matching JDs) */}
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
          onClick={onExport}
          disabled={disabled || exportDisabled || exporting}
        >
          {exporting ? t('actions.exporting') : t('actions.exportExcel')}
        </Button>
      </div>

    </div>
  );
}
