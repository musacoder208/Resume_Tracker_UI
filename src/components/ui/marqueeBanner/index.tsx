import type { JSX } from 'react';
import './styles.css';

interface MarqueeBannerProps {
  badgeText: string;
  text: string;
}

export function MarqueeBanner({ badgeText, text }: MarqueeBannerProps): JSX.Element {
  return (
    <div className="marquee-banner flex h-10 flex-shrink-0 items-center overflow-hidden bg-primary">
      {/* Fixed badge */}
      <div className="relative z-10 flex flex-shrink-0 items-center bg-primary pe-4 ps-4">
        <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-text">
          {badgeText}
        </span>
      </div>

      {/* Scrolling text area — clipped */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="marquee-track" dir="ltr">
          <span className="flex-shrink-0 whitespace-nowrap pe-24 text-sm text-primary-subtle">
            {text}
          </span>
          <span className="flex-shrink-0 whitespace-nowrap pe-24 text-sm text-primary-subtle">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
