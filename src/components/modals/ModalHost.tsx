import { useEffect, useState } from 'react';
import { ErrorModal } from './ErrorModal';
import type { ErrorModalProps } from './modal.types';

type ErrorModalEvent = Omit<ErrorModalProps, 'open' | 'onClose'>;

declare global {
  interface Window {
    __emitErrorModal?: (payload: ErrorModalEvent) => void;
  }
}

export function ModalHost(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<ErrorModalEvent>({
    title: 'Error',
    message: '',
    variant: 'error',
  });

  useEffect(() => {
    window.__emitErrorModal = (p) => {
      setPayload(p);
      setOpen(true);
    };
    return () => {
      window.__emitErrorModal = undefined;
    };
  }, []);

  return (
    <ErrorModal
      open={open}
      title={payload.title}
      message={payload.message}
      code={payload.code}
      details={payload.details}
      variant={payload.variant}
      primaryActionLabel={payload.primaryActionLabel}
      onPrimaryAction={payload.onPrimaryAction}
      onClose={() => setOpen(false)}
    />
  );
}
