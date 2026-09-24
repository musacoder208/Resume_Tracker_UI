import type { JSX } from 'react';
import clsx from 'clsx';
import type { InterviewModeCode, LookupOption } from '../../types/interviewProcess.types';

export interface InterviewTypeToggleProps {
  /** Interview mode lookup options (ONLINE / OFFLINE), from GET /interview-modes. */
  options: LookupOption[];
  value: InterviewModeCode | null;
  onChange: (code: InterviewModeCode) => void;
  disabled?: boolean;
}

/** Simple informational Online/Offline toggle — no meeting link/location field. */
export function InterviewTypeToggle({ options, value, onChange, disabled = false }: InterviewTypeToggleProps): JSX.Element {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const code = opt.code as InterviewModeCode;
        const active = value === code;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => { onChange(code); }}
            className={clsx(
              'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
              active ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-muted hover:border-primary/60',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
