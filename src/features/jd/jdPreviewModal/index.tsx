import { useState, type JSX } from 'react';
import { BaseModal } from '@/components/modals/BaseModal';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer/MarkdownRenderer';
import { toastService } from '@/components/ui/toast/toastService';
import { PaperAirplaneIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { useUpdateTheoryMutation } from '../api/jd.api';
import type { FieldValues } from '../types/jd.types';

interface JdPreviewModalProps {
  open: boolean;
  theory: string;
  jdId: number;
  fieldValues: FieldValues;
  onClose: () => void;
  onTheoryUpdated: () => void;
}

export function JdPreviewModal({
  open,
  theory,
  jdId,
  fieldValues,
  onClose,
  onTheoryUpdated,
}: JdPreviewModalProps): JSX.Element {
  const { t } = useT('jd');
  const [userText, setUserText] = useState('');
  const [updateTheory, { isLoading }] = useUpdateTheoryMutation();

  async function handleSubmit(): Promise<void> {
    if (userText.trim() === '') return;
    try {
      const data = await updateTheory({
        jd_id: jdId,
        edit_command: userText,
        field_values: fieldValues,
        rendered_text: theory,
      }).unwrap();
      if (data.message) toastService.success(data.message);
      if (data.success) {
        setUserText('');
        onClose();
        onTheoryUpdated();
      }
    } catch {
      // error toast handled by apiToastMiddleware
    }
  }

  return (
    <BaseModal
      open={open}
      title={t('preview.title')}
      onClose={onClose}
      size="2xl"
      panelClassName="!max-w-4xl"
    >
      <div className="flex flex-col gap-4">
        <div className="max-h-(--layout-modal-preview-max-height) overflow-y-auto pr-1">
          <MarkdownRenderer content={theory} />
        </div>

        {/* <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-text">{t('chat.discussWithAi')}</p>
          <div className="flex items-end gap-2">
            <textarea
              value={userText}
              onChange={(e) => { setUserText(e.target.value); }}
              rows={3}
              placeholder={t('preview.theoryInputPlaceholder')}
              className="flex-1 resize-none rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {userText.trim() !== '' && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => { void handleSubmit(); }}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div> */}
      </div>
    </BaseModal>
  );
}
