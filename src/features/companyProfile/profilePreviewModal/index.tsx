import type { JSX } from 'react';
import { BaseModal } from '@/components/modals/BaseModal';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer/MarkdownRenderer';
import { useT } from '@/i18n/useT';

interface ProfilePreviewModalProps {
  open: boolean;
  theory: string;
  onClose: () => void;
  onEditAnswer: () => void;
}

export function ProfilePreviewModal({
  open,
  theory,
  onClose,
  onEditAnswer,
}: ProfilePreviewModalProps): JSX.Element {
  const { t } = useT('companyProfile');

  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onEditAnswer}>
        {t('actions.editAnswer')}
      </Button>
      <Button variant="soft" size="sm">
        {t('actions.saveDraft')}
      </Button>
      <Button variant="primary" size="sm">
        {t('actions.saveAndPublish')}
      </Button>
    </>
  );

  return (
    <BaseModal
      open={open}
      title={t('preview.title')}
      onClose={onClose}
      size="xl"
      footer={footer}
    >
      <div className="max-h-(--layout-modal-preview-max-height) overflow-y-auto pr-1">
        <MarkdownRenderer content={theory} />
      </div>
    </BaseModal>
  );
}
