import "server-only";

import { PLACEHOLDER_FIELDS } from "@/content/site";
import { services as contentServices } from "@/content/services";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOpeningHours as resolveOpeningHours, summariseHours } from "@/lib/services/hours";
import type { Service, ServiceCategoryId } from "@/types/content";

/**
 * Read layer for public site content.
 *
 * Pattern used across the app: query Supabase when it is configured and the
 * table has rows, otherwise fall back to the typed content files. That means
 * the site is complete today and switches to database-driven content the moment
 * the dashboard starts managing it — with no changes in the components.
 */

/**
 * Opening hours are resolved in exactly one place — `src/lib/services/hours.ts`
 * — so the booking engine, the header, the footer and the dashboard editor can
 * never disagree. This is a thin, single-source re-export.
 */
export async function getOpeningHours() {
  return resolveOpeningHours();
}

/** Human summary of the resolved schedule, e.g. "Open 24 hours, 7 days a week". */
export async function getScheduleSummary(): Promise<string> {
  return summariseHours(await resolveOpeningHours());
}

function rowToService(row: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  details: string[] | null;
  duration_minutes: number | null;
  image_url: string | null;
  featured: boolean | null;
  active: boolean | null;
}): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    category: (row.category ?? "preventive") as ServiceCategoryId,
    details: row.details ?? [],
    durationMinutes: row.duration_minutes ?? 30,
    image: row.image_url,
    featured: Boolean(row.featured),
    active: row.active ?? true,
  };
}

export async function getPublicServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return contentServices.filter((service) => service.active);

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, slug, title, summary, category, details, duration_minutes, image_url, featured, active",
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return contentServices.filter((service) => service.active);
    }

    return data.map(rowToService);
  } catch {
    return contentServices.filter((service) => service.active);
  }
}

export async function getFeaturedServices(limit = 3): Promise<Service[]> {
  const all = await getPublicServices();
  const featured = all.filter((service) => service.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  const all = await getPublicServices();
  return all.find((service) => service.id === id);
}

/** Which placeholder fields are still pending — powers the readiness panel. */
export function getPlaceholderFields(): readonly string[] {
  return PLACEHOLDER_FIELDS;
}
