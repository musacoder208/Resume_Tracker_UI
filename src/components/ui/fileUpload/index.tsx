import { useRef, useState, useCallback } from 'react';
import type { JSX } from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@/icons';

export interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  title?: string;
  required?: boolean;
  description?: string;
  dropText?: string;
  dropLink?: string;
  dropHint?: string;
  error?: string;
  className?: string;
}

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

export function FileUpload({
  value,
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMb = 5,
  title,
  required = false,
  description,
  dropText,
  dropLink,
  dropHint,
  error,
  className,
}: FileUploadProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null): void => {
    if (file == null) { onChange(null); return; }
    if (!ALLOWED_TYPES.includes(file.type)) { return; }
    if (file.size > maxSizeMb * 1024 * 1024) { return; }
    onChange(file);
  }, [onChange, maxSizeMb]);

  const handleDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0] ?? null;
    handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
    if (fileRef.current != null) fileRef.current.value = '';
  }, [handleFile]);

  return (
    <div className={clsx('rounded-lg border border-border p-5', className)}>
      {title != null && (
        <div className="mb-5">
          <p className="text-sm font-bold text-text">
            {title}
            {required && <span className="ms-1 text-error">*</span>}
          </p>
          {description != null && (
            <p className="mt-1 text-xs text-text-muted">{description}</p>
          )}
        </div>
      )}

      {value != null ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-background-subtle px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-text">{value.name}</p>
            <p className="text-xs text-text-muted">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ms-3 flex-shrink-0 rounded p-1 text-text-muted transition-colors hover:text-error"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-8 transition-colors',
            dragOver ? 'border-primary bg-primary-subtle/30' : 'border-border bg-background',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          <svg className="h-10 w-10 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="mt-3 text-xs text-text-muted">
            <span className="font-semibold text-primary underline">{dropLink ?? 'Click to upload'}</span>
            {' '}{dropText ?? 'or drag & drop'}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">{dropHint ?? `PDF, JPG, PNG up to ${maxSizeMb} MB`}</p>
        </div>
      )}

      {error != null && error !== '' && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}
    </div>
  );
}
