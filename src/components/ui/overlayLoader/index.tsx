import type { JSX } from 'react';
import { IMAGES } from '@/icons/images';

export function OverlayLoader(): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 rounded-lg bg-background/80 backdrop-blur-sm">
      <img src={IMAGES.logo} alt="EQAS" className="h-10 w-auto animate-pulse" />
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
      </div>
    </div>
  );
}
