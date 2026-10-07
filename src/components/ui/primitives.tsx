import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- headings -- */

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p className={cn(tone === "dark" ? "eyebrow-on-dark" : "eyebrow", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Tag
        className={cn(
          "font-heading font-normal tracking-tight",
          Tag === "h1" ? "text-display-sm sm:text-display-md lg:text-display-lg" : "text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
          tone === "dark" ? "text-white" : "text-ink-900",
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "max-w-prose font-body text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-ink-100/80" : "text-ink-600",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- badges -- */

type BadgeTone = "neutral" | "gold" | "brand" | "success" | "warning" | "danger" | "info";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "border-ink-900/12 bg-ink-900/5 text-ink-700",
  gold: "border-gold-ink/30 bg-gold-ink/10 text-gold-ink",
  brand: "border-brand-700/25 bg-brand-700/8 text-brand-800",
  // Success reads as deep dental blue, not green — the palette is navy/blue/gold only.
  success: "border-brand-800/30 bg-brand-800/10 text-brand-800",
  warning: "border-amber-600/30 bg-amber-400/15 text-amber-900",
  danger: "border-red-500/25 bg-red-500/10 text-red-700",
  info: "border-sky-600/25 bg-sky-500/10 text-sky-800",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-ui text-[0.6875rem] font-semibold uppercase tracking-wider",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Marks anything that is still demo/placeholder content.
 * Used deliberately and visibly so unfinished content can never ship unnoticed.
 */
export function PlaceholderBadge({
  label = "Demo content",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      title="Placeholder — replace with the clinic's real information before launch."
      className={cn("placeholder-note", className)}
    >
      <span aria-hidden="true">◆</span>
      {label}
    </span>
  );
}

const STATUS_TONES: Record<string, BadgeTone> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "info",
  no_show: "neutral",
  new: "gold",
  in_progress: "warning",
  resolved: "success",
  spam: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? "neutral";
  return <Badge tone={tone}>{status.replace(/_/g, " ")}</Badge>;
}

/* --------------------------------------------------------------- surfaces -- */

export function Alert({
  children,
  tone = "info",
  title,
  className,
}: {
  children?: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  className?: string;
}) {
  const tones = {
    info: "border-brand-700/20 bg-brand-50 text-ink-800",
    success: "border-brand-800/25 bg-brand-50 text-ink-900",
    warning: "border-amber-500/30 bg-amber-50 text-amber-900",
    danger: "border-red-500/25 bg-red-50 text-red-800",
  } as const;

  const icons = { info: "ℹ", success: "✓", warning: "!", danger: "×" } as const;

  return (
    <div
      role="status"
      className={cn("flex gap-3 rounded-xl border px-4 py-3.5 text-sm", tones[tone], className)}
    >
      <span aria-hidden="true" className="mt-0.5 font-semibold">
        {icons[tone]}
      </span>
      <div className="min-w-0">
        {title && <p className="font-ui font-semibold">{title}</p>}
        {children && <div className={cn("font-body leading-relaxed", title && "mt-1")}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = "◍",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-ink-900/15 bg-cream-50 px-6 py-12 text-center">
      <span aria-hidden="true" className="mb-4 text-2xl text-gold-ink">
        {icon}
      </span>
      <h3 className="font-heading text-xl text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-ink-600">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Stat({
  value,
  label,
  hint,
  tone = "light",
}: {
  value: ReactNode;
  label: string;
  hint?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "font-heading text-3xl sm:text-4xl",
          tone === "dark" ? "text-gold" : "text-brand-800",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "font-ui text-xs font-semibold uppercase tracking-wider",
          tone === "dark" ? "text-white/80" : "text-ink-600",
        )}
      >
        {label}
      </span>
      {hint && (
        <span
          className={cn(
            "font-body text-xs",
            tone === "dark" ? "text-white/50" : "text-ink-400",
          )}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ media -- */

/**
 * Renders a photo when one exists, otherwise a branded placeholder.
 *
 * This is why the site has no broken images: every service, gallery item and
 * team member currently has `image: null`. Set an image URL (local path or
 * Supabase Storage URL) and the real photo appears with no other change.
 */
export function MediaPlaceholder({
  src,
  alt,
  label,
  caption,
  tag,
  className,
  imageClassName,
  icon = "◈",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  src: string | null;
  alt: string;
  label?: string;
  caption?: string;
  /**
   * Small corner label shown *over* a real image — used for stand-in imagery
   * so it is never mistaken for a photograph of this clinic.
   */
  tag?: string;
  className?: string;
  imageClassName?: string;
  icon?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
        {tag && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink-900/80 px-3 py-1 font-ui text-[0.625rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            {tag}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt} — photograph pending`}
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        "bg-[linear-gradient(135deg,#123054_0%,#0B2342_55%,#06152B_100%)]",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 noise-overlay opacity-40" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(194,160,107,0.22),transparent_55%)]"
      />
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
        <span aria-hidden="true" className="text-xl text-gold/80">
          {icon}
        </span>
        {label && (
          <span className="font-heading text-lg text-white/90">{label}</span>
        )}
        <span className="font-ui text-[0.625rem] font-semibold uppercase tracking-eyebrow text-gold/80">
          {caption ?? "Photo pending"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ misc --- */

export function Hairline({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("hairline", className)} />;
}

export function ValueList({
  items,
  tone = "light",
  className,
}: {
  items: readonly string[];
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full",
              tone === "dark" ? "bg-gold" : "bg-gold-ink",
            )}
          />
          <span
            className={cn(
              "font-body text-sm leading-relaxed",
              tone === "dark" ? "text-ink-100/85" : "text-ink-700",
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
