import { useState, type JSX } from 'react';

export function FormErrorBanner({
  message,
}: {
  message?: string;
}): JSX.Element | null {
//   const [dismissed, setDismissed] = useState(false);

//   const closeErrorBanner = useCallback((): void => {
//     setDismissed(true);
//   }, []);

  // Reset dismissal when message changes
  if (!message) return null;

  return (
    <FormErrorContent
    //   key={message} // 🔑 resets internal state when message changes
      message={message}
    />
  );
}

function FormErrorContent({
  message,
}: {
  message: string;
}): JSX.Element | null {
  const [visible] = useState(true);

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-20 mb-4 rounded-md border border-border bg-surface-muted px-4 py-3 text-xs text-error">

      {message}

      {/* <button
        type="button"
        onClick={() => setVisible(false)}
        className="hidden ml-4 inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:text-white"
      >
        <span className="sr-only">Close</span>
        <XMarkIcon className="size-5" />
      </button> */}
    </div>
  );
}
