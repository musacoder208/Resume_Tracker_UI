import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import type { JSX } from 'react';

interface SelectBaseProps<TOption> {
  options: readonly TOption[];

  getOptionKey: (option: TOption) => string | number;

  /** Renders an option in the dropdown */
  renderOption: (option: TOption, selected: boolean) => JSX.Element;

  /** Optional placeholder when nothing is selected */
  placeholder?: JSX.Element;

  disabled?: boolean;
}

export interface SingleSelectProps<TOption> extends SelectBaseProps<TOption> {
  multiple?: false;

  value: TOption | null;
  onChange: (value: TOption | null) => void;

  /** Renders a selected option (never null) */
  renderValue: (option: TOption) => JSX.Element;
}

export interface MultipleSelectProps<TOption> extends SelectBaseProps<TOption> {
  /** Allow picking several options — value becomes an array */
  multiple: true;

  value: TOption[];
  onChange: (value: TOption[]) => void;

  /** Renders the selected options (never empty) */
  renderValue: (options: TOption[]) => JSX.Element;
}

export type SelectProps<TOption> = SingleSelectProps<TOption> | MultipleSelectProps<TOption>;

export function Select<T>(props: SelectProps<T>): JSX.Element {
  const {
    options,
    getOptionKey,
    renderOption,
    placeholder = <span className="text-text-muted">…</span>,
    disabled = false,
  } = props;

  let display: JSX.Element;
  if (props.multiple === true) {
    display = props.value.length > 0 ? props.renderValue(props.value) : placeholder;
  } else {
    display = props.value != null ? props.renderValue(props.value) : placeholder;
  }

  const content = (
    <div className="relative mt-2">
      <ListboxButton className="grid w-full grid-cols-1 rounded-md bg-surface py-1.5 ps-3 pe-2 text-start outline-1 -outline-offset-1 outline-border focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-none sm:text-sm data-disabled:cursor-not-allowed data-disabled:opacity-60">
        <span className="col-start-1 row-start-1 truncate pe-6">
          {display}
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
  );

  if (props.multiple === true) {
    return (
      <Listbox
        value={props.value}
        onChange={props.onChange}
        by={(a: T, b: T) => getOptionKey(a) === getOptionKey(b)}
        multiple
        disabled={disabled}
      >
        {content}
      </Listbox>
    );
  }

  return (
    <Listbox value={props.value} onChange={props.onChange} disabled={disabled}>
      {content}
    </Listbox>
  );
}
