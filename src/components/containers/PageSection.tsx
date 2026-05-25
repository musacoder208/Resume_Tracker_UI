import type { JSX } from "react";

export function PageSection({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="mt-6 space-y-4">
      {children}
    </div>
  );
}
