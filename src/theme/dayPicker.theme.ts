import type { ClassNames } from 'react-day-picker';
/**
 * Shared `react-day-picker` classNames.
 * Extracted to keep JSX lean and avoid recreating the object on each render.
 */
// export const dayPickerClassNames: ClassNames = {
//   root: 'p-3',
//   months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
//   month: 'space-y-4',
//   month_caption: 'flex justify-center pt-1 pb-2 relative items-center h-10',
//   caption_label: 'text-sm font-medium text-text px-2',
//   nav: 'flex items-center gap-1',
//   button_previous:
//     'absolute left-0 h-8 w-8 bg-transparent p-1 hover:bg-surface-muted rounded-md text-text inline-flex items-center justify-center',
//   button_next:
//     'absolute right-0 h-8 w-8 bg-transparent p-1 hover:bg-surface-muted rounded-md text-text inline-flex items-center justify-center',
//   month_grid: 'w-full border-collapse space-y-1 mt-2',
//   weekdays: 'flex',
//   weekday: 'text-text-muted rounded-md w-9 font-normal text-[0.8rem]',
//   week: 'flex w-full mt-2',
//   day: 'h-9 w-9 text-center text-sm p-0 relative text-text hover:bg-surface-muted rounded-md',
//   day_button: 'h-9 w-9 p-0 font-normal',
//   selected:
//     'bg-primary text-white hover:bg-primary-hover hover:text-white focus:bg-primary-hover focus:text-white',
//   range_start: 'bg-primary text-white',
//   range_end: 'bg-primary text-white',
//   range_middle: 'bg-primary/20 text-text',
//   today: 'bg-surface-muted text-text font-semibold',
//   outside: 'text-text-muted opacity-50',
//   disabled: 'text-text-muted opacity-50 cursor-not-allowed',
//   hidden: 'invisible',
// } as const;

export const dayPickerClassNames: Partial<ClassNames> = {
  root: 'p-3',

  months: 'flex flex-col sm:flex-row gap-4',

  month: 'space-y-4',

  /* Caption row */
  month_caption: 'relative h-12 px-3 flex items-center',

  /* Caption text (left aligned, vertically centered) */
  caption_label: 'text-sm font-medium text-text leading-tight',

  /* Nav container (top-right, vertically centered by height match) */
  nav: 'absolute end-2 top-0 h-12 flex items-center gap-1 z-20',

  /* Previous button */
  button_previous:
    'h-8 w-8 rounded-md bg-transparent ' +
    'inline-flex items-center justify-center ' +
    'text-text hover:bg-surface-muted',

  /* Next button */
  button_next:
    'h-8 w-8 rounded-md bg-transparent ' +
    'inline-flex items-center justify-center ' +
    'text-text hover:bg-surface-muted',

  /* Push calendar grid below caption */
  month_grid: 'w-full border-collapse space-y-1 mt-4',

  weekdays: 'flex',

  weekday: 'text-text-muted rounded-md w-9 font-normal text-[0.8rem]',

  week: 'flex w-full mt-2',

  day: 'relative h-9 w-9 rounded-md text-center text-sm p-0 ' + 'text-text hover:bg-surface-muted',

  day_button: 'h-9 w-9 p-0 font-normal',

  selected: 'bg-primary text-white hover:bg-primary-hover focus:bg-primary-hover',

  range_start: 'bg-primary text-white',
  range_end: 'bg-primary text-white',
  range_middle: 'bg-primary/20 text-text',

  today: 'bg-surface-muted text-text font-semibold',

  outside: 'text-text-muted opacity-50',

  disabled: 'text-text-muted opacity-50 cursor-not-allowed',

  hidden: 'invisible',
} as const;
