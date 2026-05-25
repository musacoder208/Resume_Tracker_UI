import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/useT';
import './styles.css';

export function NotFound(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useT('notFound');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <svg
          className="mx-auto mb-8 h-64 w-64"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="80" fill="#f0f4f8" className="container" />
          <g className="tube1">
            <path d="M70 120 L70 80 L75 75 L75 120 Z" fill="#3b82f6" opacity="0.3" />
            <ellipse cx="72.5" cy="75" rx="5" ry="3" fill="#3b82f6" opacity="0.3" />
          </g>
          <g className="tube2">
            <path d="M90 130 L90 70 L97 65 L97 130 Z" fill="#10b981" opacity="0.4" />
            <ellipse cx="93.5" cy="65" rx="6" ry="3.5" fill="#10b981" opacity="0.4" />
          </g>
          <g className="tube3">
            <path d="M115 125 L115 85 L120 80 L120 125 Z" fill="#f59e0b" opacity="0.3" />
            <ellipse cx="117.5" cy="80" rx="5" ry="3" fill="#f59e0b" opacity="0.3" />
          </g>
          <rect x="60" y="130" width="80" height="5" rx="2" fill="#64748b" />
          <text x="100" y="110" fontSize="48" fontWeight="bold" fill="#1e293b" textAnchor="middle">
            404
          </text>
        </svg>
        <h1 className="text-4xl font-bold text-text animate-[fadeIn_0.6s_ease-out]">
          {t('title')}
        </h1>
        <p className="mt-2 text-text-muted animate-[fadeIn_0.8s_ease-out]">{t('description')}</p>
        <button
          onClick={() => void navigate('/')}
          className="mt-6 rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90 transition-colors animate-[fadeIn_1s_ease-out]"
        >
          {t('goHome')}
        </button>
      </div>
    </div>
  );
}
