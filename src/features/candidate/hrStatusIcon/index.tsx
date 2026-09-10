import type { JSX } from 'react';
import clsx from 'clsx';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@/icons';

type IconComponent = typeof CheckCircleIcon;

interface HrStatusConfig {
  Icon: IconComponent;
  colorClass: string;
  bgClass: string;
  label: string;
}

// Reads the code case-insensitively since the backend sends it uppercase
// (e.g. "PENDING"). Shared by both the icon-only (grid) and badge (card)
// presentations below so the color/label mapping stays in one place.
function getHrStatusConfig(code: string | null, label: string | null): HrStatusConfig | null {
  const normalized = code?.toLowerCase() ?? '';

  if (normalized === 'selected') {
    return { Icon: CheckCircleIcon, colorClass: 'text-success', bgClass: 'bg-success/10', label: label ?? 'Selected' };
  }
  if (normalized === 'rejected') {
    return { Icon: XCircleIcon, colorClass: 'text-error', bgClass: 'bg-error/10', label: label ?? 'Rejected' };
  }
  if (normalized === 'pending') {
    return { Icon: ClockIcon, colorClass: 'text-warning', bgClass: 'bg-warning/10', label: label ?? 'Pending' };
  }
  return null;
}

interface HrStatusIconProps {
  code: string | null;
  label: string | null;
  className?: string;
}

// Icon-only presentation — used in the grid view's compact status column.
export function HrStatusIcon({ code, label, className }: HrStatusIconProps): JSX.Element | null {
  const config = getHrStatusConfig(code, label);
  if (config == null) return null;
  const { Icon, colorClass } = config;
  return <Icon className={clsx('h-5 w-5', colorClass, className)} title={config.label} />;
}

// Icon + label pill — used on CandidateListCard, where the status should be
// readable at a glance, not just inferable from the icon's color.
export function HrStatusBadge({ code, label, className }: HrStatusIconProps): JSX.Element | null {
  const config = getHrStatusConfig(code, label);
  if (config == null) return null;
  const { Icon, colorClass, bgClass } = config;
  return (
    <span className={clsx('flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', bgClass, colorClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
