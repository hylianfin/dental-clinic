import { RiMailLine, RiPhoneLine } from "react-icons/ri";

import { Badge, EmptyState } from "@/components/ui/primitives";
import { toggleContactMessageReadAction } from "@/lib/actions/admin-messages";
import { listContactMessagesForAdmin } from "@/lib/services/contact";
import { formatInstant } from "@/lib/booking/time";
import { bookingConfig } from "@/lib/booking/config";
import { titleCase } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const { records, demoMode } = await listContactMessagesForAdmin();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-ink-900">Messages</h1>
          <p className="mt-2 font-body text-sm text-ink-600">
            Enquiries submitted through the contact form.
          </p>
        </div>
        <Badge tone={demoMode ? "warning" : "success"}>
          {demoMode ? "Demo data" : "Live data"}
        </Badge>
      </header>

      {records.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Messages sent through the contact form will appear here, newest first."
          icon="✉"
        />
      ) : (
        <ul className="space-y-4">
          {records.map((message) => (
            <li
              key={message.id}
              className={
                message.read
                  ? "rounded-card border border-ink-900/10 bg-white p-5"
                  : "rounded-card border border-gold-ink/35 bg-gold-ink/[0.03] p-5"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-ui text-sm font-medium text-ink-900">
                    {message.name}
                    {!message.read && <Badge tone="gold">Unread</Badge>}
                    <Badge tone="neutral">{titleCase(message.subject)}</Badge>
                  </p>

                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1.5">
                      <RiMailLine aria-hidden="true" className="h-3.5 w-3.5" />
                      <a href={`mailto:${message.email}`} className="hover:text-brand-700">
                        {message.email}
                      </a>
                    </span>
                    {message.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <RiPhoneLine aria-hidden="true" className="h-3.5 w-3.5" />
                        {message.phone}
                      </span>
                    )}
                    <span>
                      {formatInstant(message.createdAt, bookingConfig.timeZone, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>

                <form action={toggleContactMessageReadAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="read" value={message.read ? "false" : "true"} />
                  <button type="submit" className="btn-outline px-4 py-2 text-xs">
                    {message.read ? "Mark unread" : "Mark read"}
                  </button>
                </form>
              </div>

              <p className="mt-4 whitespace-pre-line border-t border-ink-900/8 pt-4 font-body text-sm leading-relaxed text-ink-700">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
