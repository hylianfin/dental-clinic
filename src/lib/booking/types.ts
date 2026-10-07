import type { AppointmentStatus } from "@/lib/supabase/types";

export interface TimeSlot {
  /** Wall-clock label in clinic time, e.g. "09:00". */
  time: string;
  /** Exact UTC instant. */
  startsAt: string;
  endsAt: string;
  available: boolean;
  /** Reason a slot is unavailable — shown in the admin dashboard. */
  unavailableReason?: "booked" | "time_off" | "past" | "lead_time";
}

export interface DayAvailability {
  /** `YYYY-MM-DD` in clinic time. */
  date: string;
  /** `true` when the clinic is open that weekday. */
  open: boolean;
  slots: TimeSlot[];
}

/** One day in the booking calendar (see `lib/services/availability.ts`). */
export interface CalendarDay {
  /** `YYYY-MM-DD` in clinic time. */
  date: string;
  /** Weekday index, 0 = Sunday. */
  weekday: number;
  /** The clinic is open on this weekday. */
  open: boolean;
  /** Inside the booking horizon and still selectable. */
  bookable: boolean;
}

/** The whole horizon the booking wizard renders. */
export interface BookingCalendar {
  configured: boolean;
  timeZone: string;
  todayKey: string;
  firstBookableDate: string | null;
  lastDate: string | null;
  days: CalendarDay[];
  horizonDays: number;
  slotStepMinutes: number;
  minimumNoticeHours: number;
}

export interface BookingRecord {
  id: string;
  reference: string;
  serviceId: string | null;
  serviceTitle: string | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  isNewPatient: boolean;
  notes: string | null;
  internalNote: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  reference?: string;
  /** Field-level messages for inline form errors. */
  fieldErrors?: Record<string, string>;
  /** `true` when data was written to the local demo store instead of Supabase. */
  demoMode?: boolean;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardStats {
  todayCount: number;
  weekCount: number;
  pendingCount: number;
  unreadMessages: number;
  confirmedRate: number;
  demoMode: boolean;
}
