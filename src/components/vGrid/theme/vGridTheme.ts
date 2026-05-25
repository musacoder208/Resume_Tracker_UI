export const vGridTheme = {
  /* ── Root ── */
  root: 'flex flex-col w-full rounded-md border border-border bg-surface [overflow:clip]',

  /* ── Scroll container ── */
  scrollContainer: 'overflow-auto relative w-full [transform:translateZ(0)]',

  /* ── Table ── */
  table: 'min-w-full border-separate border-spacing-0 text-xs table-fixed',

  /* ── Header ── */
  thead: '',

  headerRow: 'bg-surface-muted',

  th: [
    'sticky top-0 z-20 bg-surface-muted',
    'h-8 px-2.5 py-0 text-[11px] font-semibold uppercase tracking-[.03em]',
    'text-text-muted border-b border-border',
    'whitespace-nowrap cursor-default',
  ].join(' '),

  thFrozen: 'z-50 bg-surface-muted border-e border-border-muted',

  thSortable: 'cursor-pointer select-none',

  /* ── Filter row ── */
  filterRow: 'bg-surface',

  filterCell: [
    'relative sticky top-8 z-10 bg-surface',
    'px-1.5 py-0.5 align-middle border-b-2 border-border font-normal',
  ].join(' '),

  filterCellFrozen: 'z-40 bg-surface border-e border-border-muted',

  filterInput: [
    'w-full h-[24px] ps-[6px] pe-[20px] text-[11px] font-medium rounded border border-border bg-surface text-text',
    'placeholder:text-text-subtle placeholder:italic placeholder:font-normal',
    'focus:outline-none focus:ring-[2px] focus:ring-primary/10 focus:border-primary',
    'transition-[border-color,box-shadow]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  filterInputActive: 'border-success',

  filterWrap: 'relative flex flex-1 items-center min-w-0',

  filterClearBtn: [
    'absolute end-[3px] top-1/2 -translate-y-1/2',
    'flex h-[12px] w-[12px] items-center justify-center rounded-full',
    'text-text-muted hover:text-error hover:bg-error-subtle',
    'border-none bg-transparent cursor-pointer p-0 transition-colors',
  ].join(' '),

  filterTypeBtn: [
    'ms-[2px] flex-shrink-0 flex h-[24px] w-[20px] items-center justify-center',
    'text-text-muted hover:text-primary border-none bg-transparent cursor-pointer',
    'transition-colors rounded',
  ].join(' '),

  filterTypeBtnActive: 'text-success',

  /* ── Filter dropdown ── */
  filterDropdown: [
    'fixed z-[9999] min-w-[180px] rounded-md border border-border',
    'bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.13),0_2px_6px_rgba(0,0,0,0.07)]',
    'py-1',
  ].join(' '),

  filterDropdownTitle: [
    'px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted',
    'border-b border-border-muted mb-1',
  ].join(' '),

  filterDropdownItem: [
    'flex items-center gap-2 px-3 py-1.5 text-[11px] text-text-muted cursor-pointer',
    'hover:bg-surface-muted hover:text-text transition-colors',
  ].join(' '),

  filterDropdownItemActive: 'text-primary font-semibold',

  /* ── Body ── */
  tbody: 'bg-surface',

  tr: [
    'group bg-surface',
    'transition-colors duration-75',
    'hover:bg-surface-hover',
  ].join(' '),

  trSelected: 'bg-primary-subtle hover:bg-primary-subtle',

  /* ── Cell ── */
  td: [
    'relative px-2.5 py-0 text-xs text-text',
    'h-[28px]',
    'whitespace-nowrap truncate',
  ].join(' '),

  tdBorder: 'border-b border-e border-border-muted',

  tdSelected: 'bg-primary-subtle',

  tdFrozen: 'sticky z-20 bg-surface group-hover:bg-surface-hover border-e border-border-muted',

  tdFrozenSelected: 'sticky z-20 bg-primary-subtle group-hover:bg-primary-subtle border-e border-border-muted',

  /* ── Last frozen separator ── */
  lastFrozenBorder: [
    'after:content-[\'\'] after:absolute after:top-0 after:end-0 after:w-px after:h-full',
    'after:bg-border after:shadow-[2px_0_6px_rgba(0,0,0,0.08)] after:pointer-events-none',
  ].join(' '),

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

  /* ── Expand row ── */
  expandRow: 'bg-surface-muted/40',
  expandCell: 'p-0 border-b border-border-muted',

  /* ── Empty state ── */
  empty: 'text-center py-8 text-xs text-text-muted',

  /* ── Footer ── */
  footer: [
    'flex items-center gap-2 border-t border-border px-3 py-0 h-[30px] bg-surface',
  ].join(' '),

  /* ── Header bar (top) ── */
  headerBar: [
    'flex items-center gap-2 border-b border-border px-3 py-0 h-[30px] bg-surface',
  ].join(' '),

  footerStats: 'text-[11px] text-text-muted me-auto flex items-center',

  footerStatsValue: 'font-semibold text-primary ms-1',

  footerStatsDivider: 'text-text-subtle mx-2 text-[11px]',

  footerLabel: 'text-[10px] text-text-subtle whitespace-nowrap',

  footerSelect: [
    'h-[18px] rounded border border-border bg-surface px-1 text-[10px] text-text',
    'focus:border-primary focus:outline-none',
  ].join(' '),

  /* ── Loading ── */
  loadingBar: 'flex items-center justify-center gap-2 py-1.5 text-[11px] text-text-muted border-t border-border bg-surface',

  loadingSpinner: 'h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent',
} as const;
