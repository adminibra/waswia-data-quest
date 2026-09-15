import type { ReactNode } from "react";

export function PageHeading({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-3xl font-bold text-foreground sm:text-[32px]">{title}</h1>
        <p className="text-base text-muted-foreground">{subtitle}</p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}