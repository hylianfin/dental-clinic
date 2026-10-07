"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffOrNull } from "@/lib/auth/require-staff";
import {
  buildAllDaySchedule,
  resetOpeningHours,
  saveOpeningHours,
  WEEKDAY_LABELS,
} from "@/lib/services/hours";
import type { OpeningHours } from "@/types/content";

/**
 * Opening-hours editor actions.
 *
 * Plain `<form>` posts (no client JavaScript required). Outcomes are reported
 * through a redirect query parameter, so the page can render a clear message
 * without needing client state.
 */

function timeOrNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function saveOpeningHoursAction(formData: FormData): Promise<void> {
  const staff = await getStaffOrNull();
  if (!staff) redirect("/admin/login?reason=signin-required");

  const preset = String(formData.get("preset") ?? "");

  if (preset === "all-day" || preset === "24-7") {
    const result = await saveOpeningHours(buildAllDaySchedule());
    revalidateHours();
    redirect(`/admin/hours?${result.ok ? "saved=24-7" : `error=${encodeURIComponent(result.message)}`}`);
  }

  if (preset === "reset") {
    const result = await resetOpeningHours();
    revalidateHours();
    redirect(`/admin/hours?${result.ok ? "saved=reset" : `error=${encodeURIComponent(result.message)}`}`);
  }

  const hours: OpeningHours[] = WEEKDAY_LABELS.map((label, weekday) => {
    const closed = formData.get(`closed-${weekday}`) === "on";
    return {
      weekday,
      label,
      closed,
      open: closed ? null : timeOrNull(formData.get(`open-${weekday}`)),
      close: closed ? null : timeOrNull(formData.get(`close-${weekday}`)),
    };
  });

  const result = await saveOpeningHours(hours);
  revalidateHours();
  redirect(`/admin/hours?${result.ok ? "saved=custom" : `error=${encodeURIComponent(result.message)}`}`);
}

function revalidateHours(): void {
  // Anywhere the schedule is displayed or used.
  revalidatePath("/admin/hours");
  revalidatePath("/admin");
  revalidatePath("/contact");
  revalidatePath("/appointment");
  revalidatePath("/");
}
