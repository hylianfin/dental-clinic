"use server";

import { revalidatePath } from "next/cache";

import { getStaffOrNull } from "@/lib/auth/require-staff";
import { markContactMessageRead } from "@/lib/services/contact";

export async function toggleContactMessageReadAction(formData: FormData): Promise<void> {
  const staff = await getStaffOrNull();
  if (!staff) return;

  const id = String(formData.get("id") ?? "");
  const read = String(formData.get("read") ?? "true") === "true";
  if (!id) return;

  await markContactMessageRead(id, read);
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
}
