import type { JSX } from 'react';
import { DocumentTextIcon } from '@/icons';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/useT';

export function JdSidePanel(): JSX.Element {
  const { t } = useT('jd');

  return (
    <div className="flex flex-col gap-4">

      {/* Upload Resumes card */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-text">{t('view.sidePanel.uploadTitle')}</p>
          <span className="text-xs text-text-muted">0/100</span>
        </div>

        {/* Drop zone */}
        <div className="mb-3 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-8">
          <DocumentTextIcon className="h-8 w-8 text-text-muted" />
          <p className="text-xs font-medium text-text">{t('view.sidePanel.clickOrDrag')}</p>
          <p className="text-xs text-text-muted">{t('view.sidePanel.formats')}</p>
          <p className="text-xs text-text-muted">{t('view.sidePanel.maxResumes')}</p>
        </div>

        <Button variant="secondary" size="sm" fullWidth>
          {t('view.sidePanel.viewCandidates')}
        </Button>
      </div>

      {/* Top Candidates card */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-text">{t('view.sidePanel.topCandidates')}</p>
          <button type="button" className="text-xs text-primary hover:text-primary/80">
            {t('view.sidePanel.viewAll')} →
          </button>
        </div>

        {/* Empty state */}
        <p className="text-xs text-text-muted">{t('view.sidePanel.noCandidates')}</p>
      </div>

    </div>
  );
}
