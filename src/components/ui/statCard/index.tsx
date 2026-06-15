import type { ComponentType, SVGProps, JSX } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="shrink-0 rounded-lg bg-primary/10 p-2.5">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}
