import { Badge, PlaceholderBadge } from "@/components/ui/primitives";
import { getReadinessReport } from "@/lib/services/readiness";
import { cn } from "@/lib/utils";

/**
 * "What still needs to be done before launch" — derived from real configuration
 * state, not from a hardcoded checklist.
 */
export async function ReadinessPanel() {
  const report = await getReadinessReport();

  return (
    <section aria-labelledby="readiness-heading" className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="readiness-heading" className="font-heading text-xl text-ink-900">
            Site readiness
          </h2>
          <p className="mt-1 font-body text-sm text-ink-600">
            Outstanding items before this site can go public.
          </p>
        </div>
        <Badge tone={report.percent === 100 ? "success" : "warning"}>
          {report.completed}/{report.total} complete
        </Badge>
      </div>

      <div
        className="mt-5 h-2 w-full overflow-hidden rounded-full bg-ink-900/8"
        role="progressbar"
        aria-valuenow={report.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Site readiness"
      >
        <div
          className="h-full rounded-full bg-brand-700 transition-[width] duration-500"
          style={{ width: `${report.percent}%` }}
        />
      </div>

      <ul className="mt-6 space-y-4">
        {report.items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                item.state === "done"
                  ? "bg-brand-700"
                  : item.state === "blocked"
                    ? "bg-red-500"
                    : "bg-amber-400",
              )}
            />
            <div className="min-w-0">
              <p className="font-ui text-sm font-medium text-ink-900">
                {item.label}
                {item.state === "done" && (
                  <span className="ml-2 font-ui text-xs font-normal text-brand-800">done</span>
                )}
              </p>
              <p className="mt-1 font-body text-xs leading-relaxed text-ink-500">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-ink-900/8 pt-5">
        <p className="font-ui text-xs font-semibold uppercase tracking-wider text-ink-500">
          Tracked placeholder fields
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {report.placeholderFields.map((field) => (
            <span
              key={field}
              className="rounded-md bg-ink-900/5 px-2 py-1 font-mono text-[0.6875rem] text-ink-600"
            >
              {field}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <PlaceholderBadge label="Search src/content/ to replace" />
        </div>
      </div>
    </section>
  );
}
