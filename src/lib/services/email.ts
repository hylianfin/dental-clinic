import "server-only";

import { appUrl, emailEnv, isEmailConfigured } from "@/lib/env";

/**
 * Outbound email.
 *
 * Uses the Resend HTTP API via `fetch`, so no SDK dependency is added. When
 * `RESEND_API_KEY` / `EMAIL_FROM` are missing the message is logged instead of
 * sent, and the caller reports `demoMode` — nothing silently pretends to send.
 *
 * Swap the `sendViaResend` implementation for any other provider; the rest of
 * the code only calls `sendEmail`.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface EmailResult {
  sent: boolean;
  reason?: string;
}

async function sendViaResend(message: EmailMessage): Promise<EmailResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${emailEnv.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailEnv.from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { sent: false, reason: `Provider responded ${response.status} ${detail.slice(0, 200)}` };
  }

  return { sent: true };
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  if (!isEmailConfigured) {
    console.info(
      `[email:skipped] RESEND_API_KEY/EMAIL_FROM not configured. Would send "${message.subject}" to ${message.to}.`,
    );
    return { sent: false, reason: "Email is not configured in this environment." };
  }

  try {
    return await sendViaResend(message);
  } catch (error) {
    return { sent: false, reason: error instanceof Error ? error.message : "Unknown email error" };
  }
}

/** Shared shell so every transactional email looks consistent. */
export function emailShell(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#fafaf8;padding:24px;font-family:Montserrat,Arial,sans-serif;color:#0b2342;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e8e3;">
      <tr>
        <td style="background:#0b2342;padding:24px 28px;">
          <p style="margin:0;color:#c2a06b;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Dr. Bouamara Dental Clinic</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:18px 28px;background:#fafaf8;border-top:1px solid #e8e8e3;">
          <p style="margin:0;font-size:12px;color:#4a7396;">
            Automated message from ${appUrl}. Please do not reply directly to this address unless
            a reply-to contact is listed above.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function appointmentRequestPatientEmail(params: {
  patientName: string;
  reference: string;
  serviceTitle: string;
  whenLabel: string;
}): EmailMessage {
  const { patientName, reference, serviceTitle, whenLabel } = params;

  return {
    to: "",
    subject: `We received your appointment request (${reference})`,
    html: emailShell(`
      <h1 style="margin:0 0 12px;font-size:22px;">Request received</h1>
      <p style="margin:0 0 16px;line-height:1.6;">Hello ${patientName},</p>
      <p style="margin:0 0 16px;line-height:1.6;">
        Thank you for your appointment request. It is now with the clinic for review —
        <strong>your slot is not confirmed yet</strong>. We will contact you to confirm or to offer
        an alternative time.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e8e8e3;border-radius:12px;padding:8px;">
        <tr><td style="padding:8px 12px;font-size:13px;color:#4a7396;">Reference</td><td style="padding:8px 12px;font-weight:600;">${reference}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#4a7396;">Service</td><td style="padding:8px 12px;">${serviceTitle}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#4a7396;">Requested time</td><td style="padding:8px 12px;">${whenLabel}</td></tr>
      </table>
      <p style="margin:16px 0 0;line-height:1.6;">
        If anything above is wrong, simply reply to this message or call the clinic.
      </p>
    `),
    text: `Request received (${reference}). Service: ${serviceTitle}. Requested time: ${whenLabel}. This is a request — the clinic will confirm it.`,
  };
}

export function appointmentClinicNotificationEmail(params: {
  reference: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceTitle: string;
  whenLabel: string;
  isNewPatient: boolean;
  notes: string | null;
}): EmailMessage {
  const {
    reference,
    patientName,
    patientEmail,
    patientPhone,
    serviceTitle,
    whenLabel,
    isNewPatient,
    notes,
  } = params;

  const rows: Array<[string, string]> = [
    ["Reference", reference],
    ["Patient", patientName],
    ["Email", patientEmail],
    ["Phone", patientPhone],
    ["Service", serviceTitle],
    ["Requested", whenLabel],
    ["New patient", isNewPatient ? "Yes" : "No"],
    ["Notes", notes && notes.length > 0 ? notes : "—"],
  ];

  return {
    to: emailEnv.clinicInbox ?? "",
    replyTo: patientEmail,
    subject: `New appointment request — ${whenLabel} — ${patientName}`,
    html: emailShell(`
      <h1 style="margin:0 0 12px;font-size:22px;">New appointment request</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${rows
          .map(
            ([label, value]) => `<tr>
          <td style="padding:8px 0;font-size:13px;color:#4a7396;width:130px;vertical-align:top;">${label}</td>
          <td style="padding:8px 0;font-weight:500;">${value}</td>
        </tr>`,
          )
          .join("")}
      </table>
      <p style="margin:16px 0 0;">
        <a href="${appUrl}/admin/appointments" style="display:inline-block;background:#1a5788;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px;">
          Open the dashboard
        </a>
      </p>
    `),
    text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
  };
}
