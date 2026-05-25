import type { JSX } from "react";

export function FormCard({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      {children}
    </div>
  );
}
