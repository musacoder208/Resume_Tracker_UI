import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@/icons';
import { useT } from '@/i18n/useT';

interface ResponseDetailsProps {
  /** Why Python changed the question — pass '' when it did not */
  correctionReason: string;
  assumptions: string[];
  notes: string[];
}

/** Collapsed "Show details": why the question was changed + assumptions + notes */
export function ResponseDetails({ correctionReason, assumptions, notes }: ResponseDetailsProps) {
  const { t } = useT('chatAssistant');
  const [open, setOpen] = useState(false);

  // Python often repeats the reason as the first assumption — show it once
  const otherAssumptions = assumptions.filter((a) => a !== correctionReason);
  if (correctionReason === '' && otherAssumptions.length === 0 && notes.length === 0) return null;

  return (
    <div>
      <Button
        variant="unstyled"
        size="xs"
        className="gap-1 px-0 text-primary hover:text-primary-hover"
        aria-expanded={open}
        onClick={() => { setOpen((v) => !v); }}
        trailingIcon={
          open
            ? <ChevronUpIcon className="size-4" aria-hidden="true" />
            : <ChevronDownIcon className="size-4" aria-hidden="true" />
        }
      >
        {open ? t('details.hide') : t('details.show')}
      </Button>

      {open && (
        <div className="mt-1 flex flex-col gap-2 rounded-md bg-surface-muted px-3 py-2 text-xs text-text-muted">
          {correctionReason !== '' && <DetailList title={t('details.reason')} items={[correctionReason]} />}
          <DetailList title={t('details.assumptions')} items={otherAssumptions} />
          <DetailList title={t('details.notes')} items={notes} />
        </div>
      )}
    </div>
  );
}

interface DetailListProps {
  title: string;
  items: string[];
}

function DetailList({ title, items }: DetailListProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-semibold text-text">{title}</p>
      <ul className="mt-0.5 list-disc ps-4">
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
