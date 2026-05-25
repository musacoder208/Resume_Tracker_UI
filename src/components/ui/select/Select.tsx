import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import type { JSX } from 'react';

export interface SelectProps<TOption> {
  value: TOption | null;
  onChange: (value: TOption | null) => void;

  options: readonly TOption[];

  getOptionKey: (option: TOption) => string | number;

  /** Renders a selected option (never null) */
  renderValue: (option: TOption) => JSX.Element;

  /** Renders an option in the dropdown */
  renderOption: (option: TOption, selected: boolean) => JSX.Element;

  /** Optional placeholder when value is null */
  placeholder?: JSX.Element;
}

export function Select<T>({
  value,
  onChange,
  options,
  getOptionKey,
  renderValue,
  renderOption,
  placeholder = <span className="text-text-muted">…</span>,
}: SelectProps<T>): JSX.Element {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative mt-2">
        <ListboxButton className="grid w-full grid-cols-1 rounded-md bg-surface py-1.5 ps-3 pe-2 text-start outline-1 -outline-offset-1 border-border focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-none sm:text-sm">
          <span className="col-start-1 row-start-1 truncate pe-6">
            {value != null ? renderValue(value) : placeholder}
          </span>
          <span className="col-start-1 row-start-1 self-center justify-self-end text-text-muted">
            ▼
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-surface py-1 shadow-lg outline-1 outline-black/5 data-closed:data-leave:opacity-0"
        >
          {options.map((option) => (
            <ListboxOption
              key={getOptionKey(option)}
              value={option}
              className="group relative cursor-default py-2 ps-3 pe-9 text-text data-focus:bg-primary data-focus:text-white"
            >
              {({ selected }) => (
                <div className="flex items-center justify-between">
                  {renderOption(option, selected)}
                  {selected && <span className="ms-2">✓</span>}
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
