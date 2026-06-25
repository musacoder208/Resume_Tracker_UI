import { Fragment } from 'react';
import type { JSX } from 'react';
import { CheckIcon, ChevronDownIcon } from '@/icons';

interface ProfileProgressProps {
  answered: number;
  total: number;
  isCompleted: boolean;
}

export function ProfileProgress({ answered, total, isCompleted }: ProfileProgressProps): JSX.Element {
  return (
    <div className="flex items-center overflow-x-auto pt-3 pb-0.5">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const stepCompleted = isCompleted || step <= answered;
        const isCurrent = !isCompleted && step === answered + 1;
        const lineGreen = i > 0 && (isCompleted || i <= answered);

        return (
          <Fragment key={step}>
            {i > 0 && (
              <div
                className={[
                  'h-px min-w-1 flex-1 transition-colors duration-500',
                  lineGreen ? 'bg-primary' : 'bg-border',
                ].join(' ')}
              />
            )}

            <div className="relative shrink-0 flex items-center justify-center">
              {isCurrent && (
                <ChevronDownIcon className="absolute -top-3.5 h-2.5 w-2.5 text-primary" />
              )}
              <div
                className={[
                  'flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold transition-colors duration-500',
                  stepCompleted || isCurrent
                    ? 'bg-primary text-white'
                    : 'border border-border bg-surface text-text-muted',
                ].join(' ')}
              >
                {stepCompleted && !isCurrent ? (
                  <CheckIcon className="h-2.5 w-2.5" />
                ) : (
                  step
                )}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
