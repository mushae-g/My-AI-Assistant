import type { ReactNode } from "react";
import { Blossom } from "@/components/Floral";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative mb-7 overflow-hidden">
      <Blossom className="absolute -top-8 right-0 h-24 w-24 text-petal/70 animate-sway" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-1.5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
          ) : null}
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
