import type { ComponentType, SVGProps, JSX } from 'react';

type StatCardColor = 'primary' | 'success' | 'warning' | 'error' | 'info';
type StatCardLayout = 'horizontal' | 'vertical';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color?: StatCardColor;
  layout?: StatCardLayout;
  active?: boolean;
}

const colorMap: Record<StatCardColor, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  success: { bg: 'bg-success/10', text: 'text-success' },
  warning: { bg: 'bg-warning/10', text: 'text-warning' },
  error:   { bg: 'bg-error/10',   text: 'text-error'   },
  info:    { bg: 'bg-info/10',    text: 'text-info'     },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = 'primary',
  layout = 'horizontal',
  active = false,
}: StatCardProps): JSX.Element {
  const { bg, text } = colorMap[color];
  const borderClass = active
    ? 'border-primary ring-2 ring-primary/20'
    : 'border-border';

  if (layout === 'vertical') {
    return (
      <div
        className={`flex flex-col gap-3 rounded-xl border bg-surface p-5 transition-shadow hover:shadow-md ${borderClass}`}
      >
        <div className={`w-fit rounded-lg p-2.5 ${bg}`}>
          <Icon className={`h-5 w-5 ${text}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-text">{value}</p>
          <p className="mt-0.5 text-xs text-text-muted">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-surface p-4 ${borderClass}`}
    >
      <div className={`shrink-0 rounded-lg p-2.5 ${bg}`}>
        <Icon className={`h-5 w-5 ${text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}
