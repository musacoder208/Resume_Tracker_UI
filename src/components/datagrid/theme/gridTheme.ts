export const gridTheme = {
  /* ── Root: card container ── */
  root: 'flex flex-col w-full rounded-md border border-border bg-surface [overflow:clip]',

  /* ── Single scroll container — both axes, GPU-accelerated for sticky precision ── */
  scrollContainer: 'overflow-auto scroll-smooth relative w-full max-h-[55vh] [transform:translateZ(0)]',

  /* ── Table ── */
  table: 'min-w-full border-separate border-spacing-0 text-xs table-fixed',

  /* ── Header — NOT sticky itself; each <th> cell handles its own stickiness ── */
  thead: '',

  /* Sort header row */
  headerRow: 'bg-surface-muted',

  /* Every sort-header cell is sticky top-0 */
  thBase: [
    'sticky top-0 z-20 bg-surface-muted',
    'h-9 px-2.5 py-0 text-[11px] font-semibold uppercase tracking-[.03em]',
    'text-text-muted border-b border-border',
    'whitespace-nowrap',
  ].join(' '),

  /* Pinned sort-header cell — higher z-index + right border */
  thPinned: 'z-50 bg-surface-muted border-e border-border-muted',

  /* Right-pinned sort-header cell */
  thPinnedRight: 'sticky z-50 bg-surface-muted border-s border-border-muted',

  /* Pinned filter-row cell — top-9 to stack below the sort header row + right border */
  thPinnedFilter: 'z-49 bg-surface border-e border-border-muted',

  /* Right-pinned filter-row cell */
  thPinnedRightFilter: 'sticky z-49 bg-surface border-s border-border-muted',

  /* Last left-pinned column — ::after pseudo draws the separator shadow on its right edge */
  lastPinnedBorder: [
    'after:content-[\'\'] after:absolute after:top-0 after:end-0 after:w-px after:h-full',
    'after:bg-border after:shadow-[2px_0_6px_rgba(0,0,0,0.08)] after:pointer-events-none',
  ].join(' '),

  /* First right-pinned column — ::before pseudo draws the separator shadow on its left edge */
  firstRightPinnedBorder: [
    'before:content-[\'\'] before:absolute before:top-0 before:start-0 before:w-px before:h-full',
    'before:bg-border before:shadow-[-2px_0_6px_rgba(0,0,0,0.08)] before:pointer-events-none',
  ].join(' '),

  /* ── Body ── */
  tbody: 'bg-surface',

  /* ── Row ── group enables hover propagation to pinned cells */
  tr: [
    'group bg-surface h-[28px]',
    'transition-colors duration-75',
    'hover:bg-surface-hover',
  ].join(' '),

  trSelected: 'bg-primary-subtle hover:bg-primary-subtle',

  /* ── Cell ── */
  tdBase: [
    'relative px-2.5 py-0 text-xs text-text',
    'h-7 max-h-7 border-b border-e border-border-muted',
    'whitespace-nowrap',
  ].join(' '),

  /* Selected non-pinned cell — explicit bg for border-separate tables */
  tdSelected: 'bg-primary-subtle',

  /* Pinned body cells — opaque bg + right border matching non-frozen bottom border */
  tdPinned: 'sticky z-20 bg-surface group-hover:bg-surface-hover border-e border-border-muted',
  tdPinnedSelected: 'sticky z-20 bg-primary-subtle group-hover:bg-primary-subtle border-e border-border-muted',

  /* Right-pinned body cells */
  tdPinnedRight: 'sticky z-20 bg-surface group-hover:bg-surface-hover border-s border-border-muted',
  tdPinnedRightSelected: 'sticky z-20 bg-primary-subtle group-hover:bg-primary-subtle border-s border-border-muted',

  tdNumeric: 'tabular-nums',

  nowrap: 'whitespace-nowrap',
  wrap: 'whitespace-normal break-words',

  tdRight: 'text-end',
  tdCenter: 'text-center',

  /* ── Checkbox ── */
  checkbox: [
    'h-[13px] w-[13px] appearance-none rounded-sm border-[1.5px] border-border-strong bg-surface cursor-pointer relative',
    'checked:border-primary checked:bg-primary',
    'checked:bg-[url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2010%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%204L3.5%206.5L9%201%27%20stroke%3D%27white%27%20stroke-width%3D%271.6%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E")] checked:bg-center checked:bg-no-repeat',
    'focus:outline-none focus:ring-0',
    'indeterminate:border-primary indeterminate:bg-primary',
    'indeterminate:bg-[url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2010%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M2%204h6%27%20stroke%3D%27white%27%20stroke-width%3D%271.6%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fsvg%3E")] indeterminate:bg-center indeterminate:bg-no-repeat',
  ].join(' '),

  /* ── Expand button ── */
  expandBtn: [
    'flex h-4 w-4 items-center justify-center rounded-[3px]',
    'border border-border-strong bg-surface-muted',
    'text-text-muted text-[11px] font-normal select-none cursor-pointer',
    'transition-all hover:border-primary hover:text-primary hover:bg-primary-subtle',
  ].join(' '),

  expandBtnOpen: [
    'flex h-4 w-4 items-center justify-center rounded-[3px]',
    'border border-warning text-warning-text bg-warning-subtle',
    'text-[11px] font-normal select-none cursor-pointer transition-all',
  ].join(' '),

  /* ── Expand detail row ── */
  expandRow: 'bg-surface-muted/40',
  expandCell: 'p-0 border-b border-border-muted',

  /* ── Empty / loading ── */
  emptyCell: 'h-24 text-center text-xs text-text-muted',

  /* ── Toolbar ── */
  toolbar: 'flex items-center justify-between gap-2 px-3 py-2 border-b border-border',


  /* ── Pagination — 30px height unified bar ── */
  pagination: [
    'flex items-center gap-2 border-b border-border px-3 py-0 h-[30px]',
  ].join(' '),

  paginationBottom: [
    'flex items-center gap-2 border-t border-border px-3 py-0 h-[30px]',
  ].join(' '),

  paginationInfo: 'text-[11px] text-text-muted me-auto',

  paginationStats: 'text-[11px] text-text-muted me-auto flex items-center',

  paginationStatsValue: 'font-semibold text-primary ms-1',

  paginationStatsDivider: 'text-text-subtle mx-2 text-[11px]',

  paginationLabel: 'text-[10px] text-text-subtle whitespace-nowrap',

  paginationButton: [
    'flex h-[18px] min-w-[18px] items-center justify-center rounded border text-[10px] font-normal',
    'border-border bg-surface text-text-muted',
    'px-1 leading-none',
    'transition-all duration-100',
    'hover:border-primary hover:text-primary hover:bg-primary-subtle',
    'disabled:cursor-default disabled:opacity-30',
  ].join(' '),

  paginationButtonActive: [
    'flex h-[18px] min-w-[18px] items-center justify-center rounded text-[10px] font-semibold',
    'bg-primary text-primary-foreground border border-primary',
    'px-1 leading-none cursor-default',
  ].join(' '),

  paginationSizeSelect: [
    'h-[18px] rounded border border-border bg-surface px-1 text-[10px] text-text',
    'focus:border-primary focus:outline-none',
  ].join(' '),

  /* ── Filter row — inside thead ── */
  /* Note: border on <tr> is not rendered in border-separate tables — border lives on <th> cells */
  filterRow: 'bg-surface',

  /* top-9 = 36px = sort header row height */
  filterCell: 'relative sticky top-9 z-10 bg-surface px-1.5 py-0.5 align-middle border-b-2 border-border font-normal',

  /* Filter input with inline clear button */
  filterInputWrap: 'relative flex flex-1 items-center min-w-0',

  filterInput: [
    'w-full h-[26px] ps-[7px] pe-[22px] text-[11px] font-medium rounded border border-border bg-surface text-text',
    'placeholder:text-text-subtle placeholder:italic placeholder:font-normal',
    'focus:outline-none focus:ring-[2px] focus:ring-primary/10 focus:border-primary',
    'transition-[border-color,box-shadow]',
  ].join(' '),

  filterInputActive: 'border-success',

  filterClearBtn: [
    'absolute end-[4px] top-1/2 -translate-y-1/2',
    'flex h-[14px] w-[14px] items-center justify-center rounded-full',
    'text-text-muted hover:text-error hover:bg-error-subtle',
    'border-none bg-transparent cursor-pointer p-0 transition-colors',
  ].join(' '),

  /* Filter type icon button */
  filterTypeBtn: [
    'ms-[3px] flex-shrink-0 flex h-[26px] w-[22px] items-center justify-center',
    'text-text-muted hover:text-primary border-none bg-transparent cursor-pointer',
    'transition-colors rounded',
  ].join(' '),

  filterTypeBtnActive: 'text-success',

  /* Filter operator dropdown */
  filterDropdown: [
    'fixed z-[9999] min-w-[200px] rounded-md border border-border',
    'bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.13),0_2px_6px_rgba(0,0,0,0.07)]',
    'py-1',
  ].join(' '),

  filterDropdownTitle: [
    'px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted',
    'border-b border-border-muted mb-1',
  ].join(' '),

  filterDropdownItem: [
    'flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted cursor-pointer',
    'hover:bg-surface-muted hover:text-text transition-colors',
  ].join(' '),

  filterDropdownItemActive: 'text-primary font-semibold',
} as const;
