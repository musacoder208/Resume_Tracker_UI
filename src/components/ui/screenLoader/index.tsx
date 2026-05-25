import type { JSX } from 'react';
import { IMAGES } from '@/icons/images';

export function ScreenLoader(): JSX.Element {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background">
      <img
        src={IMAGES.logo}
        alt="EQAS"
        className="h-10 w-auto animate-pulse"
      />
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
      </div>
    </div>
  );
}
