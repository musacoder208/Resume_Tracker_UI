import { useRef, useState, useCallback, type JSX } from 'react';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import { CloudArrowUpIcon, XMarkIcon, DocumentTextIcon } from '@/icons';

interface ResumeUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onLimitExceeded?: () => void;
  disabled?: boolean;
}

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ACCEPT_ATTR = '.pdf,.doc,.docx';
const FORMAT_BADGES = ['PDF', 'DOC', 'DOCX'] as const;
const MAX_FILES = 10;

export function ResumeUploadZone({ files, onFilesChange, onLimitExceeded, disabled = false }: ResumeUploadZoneProps): JSX.Element {
  const { t } = useT('candidate');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | null): void => {
      if (disabled || incoming == null) return;
      const valid = Array.from(incoming).filter((f) => ACCEPTED_MIME_TYPES.includes(f.type));
      if (valid.length === 0) return;
      if (files.length + valid.length > MAX_FILES) {
        onLimitExceeded?.();
        return;
      }
      onFilesChange([...files, ...valid]);
    },
    [disabled, files, onFilesChange, onLimitExceeded],
  );

  const removeFile = useCallback(
    (index: number): void => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      if (disabled) return;
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [disabled, addFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      addFiles(e.target.files);
      if (inputRef.current != null) inputRef.current.value = '';
    },
    [addFiles],
  );

  const isAtLimit = files.length >= MAX_FILES;
  const isZoneDisabled = disabled || isAtLimit;

  const handleZoneClick = useCallback((): void => {
    if (!isZoneDisabled) inputRef.current?.click();
  }, [isZoneDisabled]);

  const handleZoneKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (!isZoneDisabled && (e.key === 'Enter' || e.key === ' ')) {
      inputRef.current?.click();
    }
  }, [isZoneDisabled]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-text">{t('upload.sectionTitle')}</p>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={isZoneDisabled ? -1 : 0}
        aria-label={t('upload.dropLink')}
        aria-disabled={isZoneDisabled}
        className={clsx(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          isZoneDisabled
            ? 'cursor-not-allowed border-border-muted bg-surface-muted/40 opacity-60'
            : dragOver
              ? 'cursor-pointer border-primary bg-primary-subtle/20'
              : 'cursor-pointer border-border hover:border-primary/50 hover:bg-surface-hover/30',
        )}
        onDragOver={(e) => { e.preventDefault(); if (!isZoneDisabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        onKeyDown={handleZoneKeyDown}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          disabled={isZoneDisabled}
          onChange={handleInputChange}
          className="hidden"
        />
        <div
          className={clsx(
            'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            dragOver && !disabled ? 'bg-primary-subtle' : 'bg-surface-muted',
          )}
        >
          <CloudArrowUpIcon
            className={clsx(
              'h-7 w-7 transition-colors',
              dragOver && !disabled ? 'text-primary' : 'text-text-muted',
            )}
          />
        </div>
        <p className="mt-3 text-xs text-text-muted">
          <span className={clsx('font-semibold', disabled ? 'text-text-muted' : 'text-primary')}>
            {t('upload.dropLink')}
          </span>
          {' '}
          {t('upload.dropText')}
        </p>
        <p className="mt-1 text-xs text-text-muted">{t('upload.hint')}</p>
      </div>

      {/* Supported format badges */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">{t('upload.supportedFormats')}:</span>
        <div className="flex gap-1.5">
          {FORMAT_BADGES.map((type) => (
            <span
              key={type}
              className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-muted"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Uploaded file list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-text-muted">
            {files.length} / {MAX_FILES}{' '}
            {files.length === 1 ? t('upload.fileSelected') : t('upload.filesSelected')}
          </p>
          <div className="max-h-44 overflow-y-auto rounded-lg border border-border">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${String(index)}`}
                className="flex items-center gap-2 border-b border-border-muted px-3 py-2 last:border-b-0"
              >
                <DocumentTextIcon className="h-4 w-4 shrink-0 text-text-muted" />
                <span className="min-w-0 flex-1 truncate text-xs text-text">{file.name}</span>
                <span className="shrink-0 text-xs text-text-muted">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  aria-label={t('upload.removeFile')}
                  className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-error"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
