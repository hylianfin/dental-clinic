"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ServiceCard } from "@/components/services/ServiceCard";
import { serviceCategories } from "@/content/services";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategoryId } from "@/types/content";

/**
 * Filterable services grid.
 *
 * Filtering happens client-side over a server-provided list. With Supabase
 * connected the same component receives database rows — no change needed.
 */
export function ServiceGrid({ services }: { services: Service[] }) {
  const [active, setActive] = useState<ServiceCategoryId | "all">("all");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const service of services) {
      map.set(service.category, (map.get(service.category) ?? 0) + 1);
    }
    return map;
  }, [services]);

  const visibleCategories = serviceCategories.filter((category) =>
    counts.has(category.id),
  );

  const filtered = active === "all" ? services : services.filter((s) => s.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter services by category"
        className="flex flex-wrap gap-2.5"
      >
        <FilterButton
          selected={active === "all"}
          onClick={() => setActive("all")}
          label="All services"
          count={services.length}
        />
        {visibleCategories.map((category) => (
          <FilterButton
            key={category.id}
            selected={active === category.id}
            onClick={() => setActive(category.id)}
            label={category.shortName}
            count={counts.get(category.id) ?? 0}
          />
        ))}
      </div>

      <p aria-live="polite" className="mt-6 font-ui text-sm text-ink-500">
        Showing {filtered.length} of {services.length} treatments
      </p>

      <motion.div
        layout
        className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((service, index) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, delay: Math.min(index, 6) * 0.04 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-10 rounded-card border border-dashed border-ink-900/15 bg-cream-50 p-8 text-center font-body text-sm text-ink-600">
          No treatments in this category yet. Please check back soon or contact the clinic.
        </p>
      )}
    </div>
  );
}

function FilterButton({
  selected,
  onClick,
  label,
  count,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border px-4 py-2 font-ui text-sm transition-all duration-300 ease-premium",
        selected
          ? "border-brand-700 bg-brand-700 text-white shadow-soft"
          : "border-ink-900/12 bg-white text-ink-700 hover:border-brand-700/40 hover:text-brand-700",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold",
          selected ? "bg-white/20 text-white" : "bg-ink-900/6 text-ink-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}
