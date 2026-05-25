import { useState } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import type { JSX } from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@/icons';

import { inputBase, inputDefault, inputError } from '../comboboxStyles';

export interface MultiSelectComboboxProps<T> {
  value: T[];
  onChange: (value: T[]) => void;
  options: readonly T[];
  getOptionKey: (option: T) => string | number;
  getOptionLabel: (option: T) => string;
  filter: (query: string, option: T) => boolean;
  hasError?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelectCombobox<T>({
  value,
  onChange,
  options,
  getOptionKey,
  getOptionLabel,
  filter,
  hasError = false,
  placeholder,
  disabled = false,
}: MultiSelectComboboxProps<T>): JSX.Element {
  const [query, setQuery] = useState<string>('');

  const filteredOptions = query === '' ? options : options.filter((opt) => filter(query, opt));

  const handleSelect = (option: T | null): void => {
    if (disabled || option == null) return;
    const isSelected = value.some((v) => getOptionKey(v) === getOptionKey(option));
    if (isSelected) {
      onChange(value.filter((v) => getOptionKey(v) !== getOptionKey(option)));
    } else {
      onChange([...value, option]);
    }
    setQuery('');
  };

  const handleRemove = (option: T): void => {
    if (disabled) return;
    onChange(value.filter((v) => getOptionKey(v) !== getOptionKey(option)));
  };

  return (
    <Combobox<T | null> value={null} onChange={handleSelect} disabled={disabled}>
      <div className="relative mt-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {value.map((item) => (
              <span
                key={getOptionKey(item)}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-md"
              >
                {getOptionLabel(item)}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="hover:bg-primary/20 rounded"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <ComboboxInput
            className={clsx(
              inputBase,
              hasError ? inputError : inputDefault,
              disabled && 'bg-surface-muted cursor-not-allowed opacity-60'
            )}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => setQuery('')}
            value={query}
          />

          <ComboboxButton className="absolute inset-y-0 end-0 flex items-center px-2 focus:outline-none">
            <span className="text-text-muted">▼</span>
          </ComboboxButton>
        </div>

        <ComboboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface py-1 shadow-lg border border-border data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {filteredOptions.map((option) => {
            const isSelected = value.some((v) => getOptionKey(v) === getOptionKey(option));
            return (
              <ComboboxOption
                key={getOptionKey(option)}
                value={option}
                className="cursor-default px-3 py-2 text-text data-focus:bg-primary data-focus:text-white flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="rounded border-border"
                />
                <span>{getOptionLabel(option)}</span>
              </ComboboxOption>
            );
          })}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
