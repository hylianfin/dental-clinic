"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCalendarCheckLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiRefreshLine,
  RiUserLine,
} from "react-icons/ri";

import { DateCalendar } from "@/components/booking/DateCalendar";
import { Alert, PlaceholderBadge, StatusBadge } from "@/components/ui/primitives";
import { bookingConfig } from "@/lib/booking/config";
import { formatDateKey, formatTimeLabel } from "@/lib/booking/time";
import type {
  BookingCalendar,
  DayAvailability,
  TimeSlot,
} from "@/lib/booking/types";
import {
  fetchDayAvailabilityAction,
  submitAppointmentRequest,
  type DayAvailabilityResponse,
} from "@/lib/actions/public-booking";
import { initialFormState, type FormState } from "@/lib/forms/state";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/content";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Treatment",
  2: "Date & time",
  3: "Your details",
};

/**
 * Times are grouped so that a 24-hour schedule stays readable: with the clinic
 * open around the clock there are 48 half-hour slots to choose from.
 */
const SLOT_GROUPS = [
  { id: "night", label: "Night", range: "00:00 – 05:59", from: 0, to: 6 },
  { id: "morning", label: "Morning", range: "06:00 – 11:59", from: 6, to: 12 },
  { id: "afternoon", label: "Afternoon", range: "12:00 – 17:59", from: 12, to: 18 },
  { id: "evening", label: "Evening", range: "18:00 – 23:59", from: 18, to: 24 },
] as const;

function groupSlots(slots: TimeSlot[]) {
  return SLOT_GROUPS.map((group) => ({
    ...group,
    slots: slots.filter((slot) => {
      const hour = Number(slot.time.slice(0, 2));
      return hour >= group.from && hour < group.to;
    }),
  })).filter((group) => group.slots.length > 0);
}

export function BookingWizard({
  services,
  calendar,
  initialServiceId,
  initialDay = null,
}: {
  services: Service[];
  calendar: BookingCalendar;
  initialServiceId?: string;
  /** Availability for `calendar.firstBookableDate`, computed on the server. */
  initialDay?: DayAvailability | null;
}) {
  const [step, setStep] = useState<Step>(initialServiceId ? 2 : 1);
  const [serviceId, setServiceId] = useState<string>(initialServiceId ?? "");
  const [selectedDate, setSelectedDate] = useState<string>(
    initialServiceId ? (calendar.firstBookableDate ?? "") : "",
  );
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [day, setDay] = useState<DayAvailability | null>(
    initialServiceId ? initialDay : null,
  );
  const [dayError, setDayError] = useState<string>("");
  const [loadingDay, startDayTransition] = useTransition();

  const [formState, formAction, submitting] = useActionState<FormState, FormData>(
    submitAppointmentRequest,
    initialFormState,
  );

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [services, serviceId],
  );

  /** Loads the times for one clinic-time day. */
  const loadDay = (date: string, id: string) => {
    if (!id || !date) {
      setDay(null);
      return;
    }

    setDayError("");
    // React 19 tracks the awaited work inside an async transition, so the
    // "Checking times…" state stays up until the server answers.
    startDayTransition(async () => {
      try {
        const result: DayAvailabilityResponse = await fetchDayAvailabilityAction(id, date);
        if (!result.ok || !result.day) {
          setDay(null);
          setDayError(result.message ?? "Times could not be loaded for that day.");
          return;
        }
        setDay(result.day);
      } catch {
        setDay(null);
        setDayError("Times could not be loaded. Please check your connection and try again.");
      }
    });
  };

  // Step 2 always has a usable date selected, and its times loaded.
  useEffect(() => {
    if (!serviceId) {
      setDay(null);
      return;
    }

    const nextDate = selectedDate || calendar.firstBookableDate || "";
    if (!nextDate) return;

    if (nextDate !== selectedDate) setSelectedDate(nextDate);
    loadDay(nextDate, serviceId);
    // Re-running only when the treatment or the chosen date actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, selectedDate]);

  /** Choosing a date clears any time chosen on the previous day. */
  const chooseDate = (date: string) => {
    setSelectedTime("");
    setSelectedDate(date);
  };

  const availableSlots = day?.slots.filter((slot) => slot.available) ?? [];
  const totalSlots = day?.slots.length ?? 0;

  // ------------------------------------------------------------- success ---
  if (formState.ok && formState.reference) {
    return (
      <div className="card p-8 lg:p-10">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-700/10 text-brand-800"
        >
          <RiCheckLine className="h-7 w-7" />
        </span>

        <h2 className="mt-6 font-heading text-3xl text-ink-900">Request received</h2>
        <p className="mt-3 font-body text-base leading-relaxed text-ink-600">
          Your appointment request has been logged and the clinic will confirm the time with you.
          This is a <strong>request</strong> — the slot is not reserved until the clinic confirms it.
        </p>

        <dl className="mt-8 divide-y divide-ink-900/8 rounded-card border border-ink-900/10 bg-cream-50 p-6">
          <Row label="Reference" value={formState.reference} strong />
          {formState.serviceTitle && <Row label="Treatment" value={formState.serviceTitle} />}
          {formState.whenLabel && <Row label="Requested time" value={formState.whenLabel} />}
          <Row label="Status" value={<StatusBadge status="pending" />} />
        </dl>

        <div className="mt-6 space-y-3">
          {formState.demoMode && (
            <Alert tone="warning" title="Demo mode — not stored in a database">
              Supabase is not configured yet, so this request was written to the local demo store.
              The clinic is not actually notified until the database and email are connected.
            </Alert>
          )}

          {formState.demoMode === false && formState.emailsSent === false && (
            <Alert tone="info" title="Email confirmation not configured">
              The request is stored safely, but no confirmation email was sent because outbound
              email is not configured in this environment.
            </Alert>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              setStep(1);
              setServiceId("");
              setSelectedDate("");
              setSelectedTime("");
              setDay(null);
              window.location.reload();
            }}
          >
            Make another request
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- wizard ----
  return (
    <div className="card overflow-hidden">
      {/* Stepper */}
      <ol className="flex border-b border-ink-900/8">
        {([1, 2, 3] as Step[]).map((value) => {
          const isActive = step === value;
          const isDone = step > value;
          return (
            <li key={value} className="flex-1">
              <button
                type="button"
                onClick={() => {
                  // Backwards only: forward navigation requires a valid choice.
                  if (value < step) setStep(value);
                }}
                disabled={value > step}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex h-full w-full flex-col gap-1 border-r border-ink-900/8 px-4 py-4 text-left last:border-r-0 sm:px-6",
                  isActive && "bg-brand-700/[0.04]",
                  value < step && "cursor-pointer hover:bg-cream-50",
                  value > step && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "font-ui text-[0.625rem] font-semibold uppercase tracking-wider",
                    isActive ? "text-brand-700" : isDone ? "text-gold-ink" : "text-ink-400",
                  )}
                >
                  Step {value}
                </span>
                <span
                  className={cn(
                    "font-heading text-base sm:text-lg",
                    isActive ? "text-ink-900" : "text-ink-500",
                  )}
                >
                  {STEP_LABELS[value]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="p-6 sm:p-8 lg:p-10">
        {/* Step 1 — treatment */}
        {step === 1 && (
          <div>
            <h2 className="font-heading text-2xl text-ink-900">Which treatment do you need?</h2>
            <p className="mt-2 font-body text-sm text-ink-600">
              Choose the closest match. If you are unsure, pick a check-up and mention your concern
              in the notes.
            </p>

            <fieldset className="mt-6">
              <legend className="sr-only">Treatment</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const selected = service.id === serviceId;
                  return (
                    <label
                      key={service.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200",
                        selected
                          ? "border-brand-700 bg-brand-700/[0.04] shadow-soft"
                          : "border-ink-900/12 bg-white hover:border-brand-700/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="service-choice"
                        value={service.id}
                        checked={selected}
                        onChange={() => setServiceId(service.id)}
                        className="mt-1 h-4 w-4 accent-[#1A5788]"
                      />
                      <span className="min-w-0">
                        <span className="block font-ui text-sm font-medium text-ink-900">
                          {service.title}
                        </span>
                        <span className="mt-1 block font-body text-xs text-ink-500">
                          {service.durationMinutes} minute appointment
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="btn-primary"
                disabled={!serviceId}
                onClick={() => setStep(2)}
              >
                Choose a date &amp; time
                <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — date & time */}
        {step === 2 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-2xl text-ink-900">Pick a date and time</h2>
              {selectedService && (
                <span className="font-ui text-sm text-ink-500">
                  {selectedService.title} · {selectedService.durationMinutes} min
                </span>
              )}
            </div>

            {!selectedService && (
              <Alert tone="info" className="mt-6" title="Choose a treatment first">
                Times depend on how long the appointment takes, so pick a treatment in step 1.
              </Alert>
            )}

            {!calendar.configured && (
              <Alert tone="warning" className="mt-6" title="Online booking is not open yet">
                The clinic&apos;s opening hours are not configured, so online times are unavailable.
                Please call the clinic and it will arrange a time with you.
              </Alert>
            )}

            {calendar.configured && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
                {/* Calendar */}
                <div className="space-y-3">
                  <DateCalendar
                    days={calendar.days}
                    selectedDate={selectedDate}
                    todayKey={calendar.todayKey}
                    onSelect={chooseDate}
                    disabled={!selectedService}
                  />

                  <p className="font-body text-xs leading-relaxed text-ink-500">
                    The clinic is open 24 hours a day, every day. Dates up to{" "}
                    {calendar.horizonDays} days ahead can be requested, and times start{" "}
                    {calendar.minimumNoticeHours === 1
                      ? "1 hour"
                      : `${calendar.minimumNoticeHours} hours`}{" "}
                    from now.
                  </p>
                </div>

                {/* Times */}
                <div className="rounded-card border border-ink-900/10 bg-cream-50 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="flex items-center gap-2 font-heading text-lg text-ink-900">
                      <RiCalendarCheckLine
                        aria-hidden="true"
                        className="h-4 w-4 text-gold-ink"
                      />
                      {selectedDate ? formatDateKey(selectedDate) : "Choose a date"}
                    </h3>

                    {day && !loadingDay && (
                      <span className="font-ui text-xs text-ink-500">
                        {availableSlots.length} of {totalSlots} slots free
                      </span>
                    )}
                  </div>

                  {!selectedService && (
                    <p className="mt-4 font-body text-sm text-ink-500">
                      Pick a treatment to see the times available on each day.
                    </p>
                  )}

                  {selectedService && loadingDay && (
                    <p className="mt-6 flex items-center gap-2 font-body text-sm text-ink-500">
                      <RiLoader4Line aria-hidden="true" className="h-4 w-4 animate-spin" />
                      Checking times…
                    </p>
                  )}

                  {selectedService && !loadingDay && dayError && (
                    <div className="mt-5" role="status">
                      <p className="flex items-start gap-2 font-body text-sm text-ink-700">
                        <RiErrorWarningLine
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink"
                        />
                        {dayError}
                      </p>
                      <button
                        type="button"
                        className="btn-outline mt-4"
                        onClick={() => loadDay(selectedDate, serviceId)}
                      >
                        <RiRefreshLine aria-hidden="true" className="h-4 w-4" />
                        Try again
                      </button>
                    </div>
                  )}

                  {selectedService && !loadingDay && !dayError && day && (
                    <>
                      {availableSlots.length === 0 ? (
                        <div className="mt-5" role="status">
                          <p className="font-body text-sm text-ink-600">
                            Every slot on this day is taken or too soon to book. Try another date —
                            the clinic is open 24/7.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-5 space-y-5">
                          {groupSlots(day.slots).map((group) => (
                            <div key={group.id}>
                              <p className="flex items-baseline gap-2 font-ui text-xs font-semibold uppercase tracking-wider text-ink-500">
                                {group.label}
                                <span className="font-normal normal-case tracking-normal text-ink-400">
                                  {group.range}
                                </span>
                              </p>

                              <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                                {group.slots.map((slot) => {
                                  const isSelected = slot.time === selectedTime;
                                  return (
                                    <li key={slot.time}>
                                      <button
                                        type="button"
                                        disabled={!slot.available}
                                        aria-pressed={isSelected}
                                        title={
                                          slot.available
                                            ? undefined
                                            : slot.unavailableReason === "booked"
                                              ? "Already booked"
                                              : slot.unavailableReason === "lead_time"
                                                ? "Too soon — please pick a later slot"
                                                : "Unavailable"
                                        }
                                        onClick={() => setSelectedTime(slot.time)}
                                        className={cn(
                                          "w-full rounded-lg border px-2 py-2.5 font-ui text-sm tabular-nums transition-all duration-200",
                                          isSelected
                                            ? "border-brand-700 bg-brand-700 text-white"
                                            : slot.available
                                              ? "border-ink-900/12 bg-white text-ink-800 hover:border-brand-700/50 hover:text-brand-700"
                                              : "cursor-not-allowed border-ink-900/8 bg-cream-100 text-ink-300 line-through",
                                        )}
                                      >
                                        {formatTimeLabel(slot.time)}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="mt-5 border-t border-ink-900/8 pt-4 font-body text-xs leading-relaxed text-ink-500">
                        Times are shown in the clinic&apos;s local time
                        ({bookingConfig.timeZone.replace("_", " ")}). Slots struck through are
                        already booked or too soon to arrange.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                <RiArrowLeftLine aria-hidden="true" className="h-4 w-4" />
                Change treatment
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
              >
                Continue
                <RiArrowRightLine aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — patient details */}
        {step === 3 && (
          <form action={formAction}>
            <h2 className="font-heading text-2xl text-ink-900">Your details</h2>
            <p className="mt-2 font-body text-sm text-ink-600">
              The clinic uses these details to confirm your appointment. Nothing is shared with
              third parties.
            </p>

            {/* Selection carried into the submission */}
            <input type="hidden" name="serviceId" value={serviceId} />
            <input type="hidden" name="date" value={selectedDate} />
            <input type="hidden" name="time" value={selectedTime} />

            {/* Honeypot — hidden from humans, tempting for bots */}
            <div
              aria-hidden="true"
              className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
            >
              <label htmlFor="company">Company (leave empty)</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <dl className="mt-6 grid gap-4 rounded-card border border-ink-900/10 bg-cream-50 p-5 sm:grid-cols-2">
              <div>
                <dt className="font-ui text-xs uppercase tracking-wider text-ink-500">Treatment</dt>
                <dd className="mt-1 font-body text-sm text-ink-900">
                  {selectedService?.title ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-ui text-xs uppercase tracking-wider text-ink-500">
                  Requested time
                </dt>
                <dd className="mt-1 font-body text-sm text-ink-900">
                  {selectedDate
                    ? `${formatDateKey(selectedDate)} · ${formatTimeLabel(selectedTime)}`
                    : "—"}
                </dd>
              </div>
            </dl>

            {formState.message && !formState.ok && (
              <Alert tone="danger" className="mt-6" title="We couldn't send that request">
                {formState.message}
              </Alert>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                id="patientName"
                label="Full name"
                icon={<RiUserLine aria-hidden="true" />}
                error={formState.fieldErrors?.patientName}
                required
                autoComplete="name"
              />
              <Field
                id="patientEmail"
                label="Email"
                type="email"
                error={formState.fieldErrors?.patientEmail}
                required
                autoComplete="email"
              />
              <Field
                id="patientPhone"
                label="Phone"
                type="tel"
                error={formState.fieldErrors?.patientPhone}
                required
                autoComplete="tel"
              />

              <div>
                <label htmlFor="isNewPatient" className="label">
                  Have you visited before?
                </label>
                <select id="isNewPatient" name="isNewPatient" className="field" defaultValue="yes">
                  <option value="yes">No — this would be my first visit</option>
                  <option value="no">Yes — I am an existing patient</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="notes" className="label">
                Anything the clinic should know? (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                maxLength={1000}
                className={cn("field resize-none", formState.fieldErrors?.notes && "field-error")}
                placeholder="Symptoms, concerns, accessibility needs, or a preferred time of day…"
              />
              {formState.fieldErrors?.notes && (
                <p className="error-text">{formState.fieldErrors.notes}</p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button type="button" className="btn-ghost" onClick={() => setStep(2)}>
                <RiArrowLeftLine aria-hidden="true" className="h-4 w-4" />
                Back to times
              </button>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting && <RiLoader4Line aria-hidden="true" className="h-4 w-4 animate-spin" />}
                {submitting ? "Sending request…" : "Send appointment request"}
              </button>
            </div>

            <p className="mt-5 font-body text-xs leading-relaxed text-ink-500">
              By sending this request you agree to the clinic contacting you about it. This form does
              not create a confirmed booking.
            </p>

            <div className="mt-4">
              <PlaceholderBadge label="Policies pending" />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0">
      <dt className="font-ui text-xs uppercase tracking-wider text-ink-500">{label}</dt>
      <dd
        className={cn(
          "text-right font-body text-sm text-ink-900",
          strong && "font-mono text-base tracking-wider",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  error,
  required,
  autoComplete,
  icon,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-gold-ink">
            *
          </span>
        )}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-ink">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn("field", Boolean(icon) && "pl-10", error && "field-error")}
        />
      </div>
      {error && (
        <p id={errorId} className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
