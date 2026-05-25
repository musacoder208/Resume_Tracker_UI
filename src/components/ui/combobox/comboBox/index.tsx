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

import { inputBase, inputDefault, inputError } from '../comboboxStyles';

export interface UIComboboxProps<T> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly T[];
  getOptionKey: (option: T) => string | number;
  getOptionLabel: (option: T) => string;
  filter: (query: string, option: T) => boolean;

  renderOption?: (option: T, selected: boolean) => JSX.Element;
  renderCreateOption?: (query: string) => JSX.Element;

  hasError?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export type ComboboxSelection<T> = { type: 'option'; value: T } | { type: 'create'; query: string };

export function ComboBox<T>({
  value,
  onChange,
  options,
  getOptionKey,
  getOptionLabel,
  filter,
  renderOption,
  renderCreateOption,
  hasError = false,
  placeholder,
  disabled = false,
}: UIComboboxProps<T>): JSX.Element {
  const [query, setQuery] = useState<string>('');

  const filteredOptions = query === '' ? options : options.filter((opt) => filter(query, opt));

  return (
    <Combobox
      value={value}
      onChange={(opt: T | null) => {
        setQuery('');
        onChange(opt);
      }}
      disabled={disabled}
    >
      <div className="relative ">
        <ComboboxInput
          className={clsx(
            inputBase,
            hasError ? inputError : inputDefault,
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
          )}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => setQuery('')}
          displayValue={(opt: T | null) => (opt != null ? getOptionLabel(opt) : '')}
        />

        <ComboboxButton className="absolute inset-y-0 end-0 flex items-center px-2 focus:outline-none">
          <span className="text-text-muted">▼</span>
        </ComboboxButton>

        <ComboboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface py-1 shadow-lg border border-border data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {query.length > 0 && renderCreateOption != null && (
            <ComboboxOption
              value={null as never}
              className="cursor-default px-3 py-2 text-text data-focus:bg-primary data-focus:text-white"
            >
              {renderCreateOption(query)}
            </ComboboxOption>
          )}

          {filteredOptions.map((option) => (
            <ComboboxOption
              key={getOptionKey(option)}
              value={option}
              className="cursor-default px-3 py-2 text-text data-focus:bg-primary data-focus:text-white"
            >
              {({ selected }) =>
                renderOption != null ? (
                  renderOption(option, selected)
                ) : (
                  <span>{getOptionLabel(option)}</span>
                )
              }
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
