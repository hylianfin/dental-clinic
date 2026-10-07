import "server-only";

import type { ActionResult, ContactMessageRecord } from "@/lib/booking/types";
import { createDemoContactMessage, listDemoContactMessages, markDemoContactMessageRead } from "@/lib/data/contact-messages";
import { appUrl, isSupabaseConfigured } from "@/lib/env";
import { emailShell, sendEmail } from "@/lib/services/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: "appointment" | "consultation" | "inquiry" | "other";
  message: string;
}

export async function createContactMessage(input: ContactInput): Promise<ActionResult> {
  const record: ContactMessageRecord = {
    id: globalThis.crypto.randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone && input.phone.length > 0 ? input.phone : null,
    subject: input.subject,
    message: input.message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  let persistedViaSupabase = false;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("contact_messages").insert({
        name: record.name,
        email: record.email,
        phone: record.phone,
        subject: record.subject,
        message: record.message,
      });
      if (error) throw new Error(error.message);
      persistedViaSupabase = true;
    } catch (error) {
      console.error("[contact] Supabase insert failed, using demo store:", error);
    }
  }

  if (!persistedViaSupabase) {
    await createDemoContactMessage(record);
  }

  await sendEmail({
    to: process.env.CLINIC_NOTIFICATION_EMAIL ?? record.email,
    subject: `Website enquiry — ${record.subject}`,
    replyTo: record.email,
    html: emailShell(`
      <h1 style="margin:0 0 12px;font-size:20px;">New website enquiry</h1>
      <p style="margin:0 0 8px;"><strong>${record.name}</strong> &lt;${record.email}&gt;</p>
      <p style="margin:0 0 8px;color:#5e8f8b;font-size:13px;">Subject: ${record.subject}</p>
      <p style="margin:16px 0 0;line-height:1.6;white-space:pre-line;">${record.message}</p>
      <p style="margin:20px 0 0;font-size:13px;">
        <a href="${appUrl}/admin/messages" style="color:#1a5788;">Open the inbox</a>
      </p>
    `),
    text: `${record.name} <${record.email}>\nSubject: ${record.subject}\n\n${record.message}`,
  });

  return {
    ok: true,
    message: "Thank you — your message has reached the clinic.",
    demoMode: !persistedViaSupabase,
  };
}

export async function listContactMessagesForAdmin(): Promise<{
  records: ContactMessageRecord[];
  demoMode: boolean;
}> {
  if (!isSupabaseConfigured) {
    const records = await listDemoContactMessages();
    return { records, demoMode: true };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(300);

    if (error || !data) throw new Error(error?.message ?? "No data");

    return {
      records: data.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        createdAt: row.created_at,
        read: row.status !== "new",
      })),
      demoMode: false,
    };
  } catch (error) {
     
    console.error("[contact] Falling back to demo store:", error);
    return { records: await listDemoContactMessages(), demoMode: true };
  }
}

export async function markContactMessageRead(id: string, read = true): Promise<ActionResult> {
  if (isSupabaseConfigured) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: read ? "resolved" : "new" })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, message: read ? "Marked as read." : "Marked as unread." };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Could not update the message.",
      };
    }
  }

  const updated = await markDemoContactMessageRead(id, read);
  return updated
    ? { ok: true, message: read ? "Marked as read." : "Marked as unread.", demoMode: true }
    : { ok: false, message: "Message not found." };
}
