import type { JSX } from "react";

export function TableCard({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      {children}
    </div>
  );
}
