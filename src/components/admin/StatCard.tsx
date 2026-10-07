import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** KPI tile for the dashboard overview. */
export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  href,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warning" | "success" | "brand";
  href?: string;
  icon?: ReactNode;
}) {
  const tones = {
    default: "border-ink-900/10 bg-white",
    warning: "border-amber-500/30 bg-amber-50",
    success: "border-brand-800/25 bg-brand-50",
    brand: "border-brand-700/20 bg-brand-50",
  } as const;

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <p className="font-ui text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </p>
        {icon && <span className="text-gold-ink">{icon}</span>}
      </div>
      <p className="mt-3 font-heading text-3xl text-ink-900">{value}</p>
      {hint && <p className="mt-1 font-body text-xs text-ink-500">{hint}</p>}
    </>
  );

  const className = cn(
    "block rounded-card border p-5 shadow-soft transition-shadow duration-300",
    tones[tone],
    href && "hover:shadow-card",
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
