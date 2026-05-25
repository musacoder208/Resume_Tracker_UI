// src/components/form/DaysScheduleGrid.tsx

import type { JSX } from 'react';
import { useEffect } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';

export interface DayConfig {
  fieldName: string;
  label: string;
}

interface Props {
  dailyFieldName: string;
  dailyLabel: string;
  days: DayConfig[];
}

export function DaysScheduleGrid({ dailyFieldName, dailyLabel, days }: Props): JSX.Element {
  const { register, setValue, control } = useFormContext<FieldValues>();
  const isDaily: boolean = Boolean(useWatch({ control, name: dailyFieldName }));

  useEffect(() => {
    if (isDaily) {
      days.forEach(({ fieldName }) => {
        setValue(fieldName, true);
      });
    }
  }, [isDaily, days, setValue]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox {...register(dailyFieldName)} />
        <label className="text-sm font-medium">{dailyLabel}</label>
      </div>
      /
      {days.map(({ fieldName, label }) => (
        <div key={fieldName} className="flex items-center gap-2">
          <Checkbox {...register(fieldName)} />
          <label className="text-sm">{label}</label>
        </div>
      ))}
    </div>
  );
}
