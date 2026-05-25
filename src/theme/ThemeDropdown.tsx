import React, { useEffect, useState } from 'react';
import { applyTheme } from '@/theme/applyTheme';
import { getStoredTheme, setStoredTheme } from '@/utils/themeStorage';
import type { ThemeName } from './theme.types';

type ThemeOption = {
  value: ThemeName;
  label: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'eqas',  label: 'Eqas (Default)' },
  { value: 'light', label: 'Light' },
  { value: 'dark',  label: 'Dark' },
  { value: 'blue',  label: 'Blue' },
  { value: 'green', label: 'Green' },
];

export function ThemeDropdown(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeName>(getStoredTheme);

  useEffect(() => {
    applyTheme(current);
  }, [current]);

  const handleSelect = (theme: ThemeOption): void => {
    setStoredTheme(theme.value);
    setCurrent(theme.value);
    setOpen(false);
  };

  const selected = THEME_OPTIONS.find((t) => t.value === current);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-text hover:bg-surface-hover"
      >
        {selected?.label}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-40 rounded-md border border-border bg-surface shadow-md">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => handleSelect(theme)}
              className="block w-full px-3 py-2 text-start text-sm text-text hover:bg-surface-hover"
            >
              {theme.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
