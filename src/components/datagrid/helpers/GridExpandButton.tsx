import type { JSX, MouseEvent } from 'react';
import clsx from 'clsx';
import { gridTheme } from '../theme/gridTheme';

interface GridExpandButtonProps {
  expanded: boolean;
  onClick: (e: MouseEvent) => void;
}

export const GridExpandButton = ({ expanded, onClick }: GridExpandButtonProps): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    aria-label={expanded ? 'Collapse row' : 'Expand row'}
    className={clsx(expanded ? gridTheme.expandBtnOpen : gridTheme.expandBtn)}
  >
    {expanded ? '−' : '+'}
  </button>
);
