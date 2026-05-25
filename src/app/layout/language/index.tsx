//Dropdown to switch the active i18n language (e.g. EN/AR). Updates i18next and saves preference.

import { useEffect, useState } from 'react';
import { ChevronDownIcon } from '@/icons';
import { i18n } from '@/i18n';
import { STORAGE_KEYS } from '@/constants';
import { changeLanguage } from '@/i18n/language';

type Language = {
  code: string;
  label: string;
};

const LANGUAGES: Language[] = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'ar', label: 'العربية' },
];

export function LanguageDropdown(): React.ReactElement {
  const [open, setOpen] = useState(false);

  const [current, setCurrent] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.language) ??
      i18n.language ??
      'en'
    );
  });

  // Effect is now ONLY for side-effects
  useEffect(() => {
    void changeLanguage(current);
  }, [current]);

  const handleSelect = (lang: Language): void => {
    localStorage.setItem(STORAGE_KEYS.language, lang.code);
    setCurrent(lang.code);
    setOpen(false);
  };

  const selected = LANGUAGES.find((l) => l.code === current);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-text hover:bg-surface-muted"
      >
        {selected?.label}
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-40 rounded-md border border-border bg-surface shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang)}
              className="block w-full px-3 py-2 text-start text-sm text-text hover:bg-surface-muted"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
