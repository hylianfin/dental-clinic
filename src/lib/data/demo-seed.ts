import type { BookingRecord, ContactMessageRecord } from "@/lib/booking/types";
import { addDays, zonedWallClockToUtc } from "@/lib/booking/time";
import { bookingConfig } from "@/lib/booking/config";

/**
 * Sample records for the demo store.
 *
 * ⚠️ These are NOT real patients. Names, emails and phone numbers are obvious
 * placeholders (`example.com` is an IANA-reserved domain) and every record is
 * marked `source: "demo-seed"` so the dashboard can label it as sample data.
 */

function isoForDayOffset(dayOffset: number, time: string): string {
  const target = addDays(new Date(), dayOffset);
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: bookingConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);
  return zonedWallClockToUtc(dateKey, time, bookingConfig.timeZone).toISOString();
}

export function buildDemoAppointments(): BookingRecord[] {
  const now = new Date().toISOString();

  const samples: Array<{
    reference: string;
    name: string;
    email: string;
    phone: string;
    serviceId: string;
    serviceTitle: string;
    dayOffset: number;
    time: string;
    status: BookingRecord["status"];
    isNewPatient: boolean;
    notes: string | null;
  }> = [
    {
      reference: "DB-DEMO01",
      name: "Demo Patient A",
      email: "demo.a@example.com",
      phone: "+00 000 000 001",
      serviceId: "svc-checkup",
      serviceTitle: "Check-up & cleaning",
      dayOffset: 0,
      time: "09:00",
      status: "confirmed",
      isNewPatient: true,
      notes: "Sample record — safe to delete.",
    },
    {
      reference: "DB-DEMO02",
      name: "Demo Patient B",
      email: "demo.b@example.com",
      phone: "+00 000 000 002",
      serviceId: "svc-whitening",
      serviceTitle: "Teeth whitening",
      dayOffset: 0,
      time: "11:30",
      status: "pending",
      isNewPatient: false,
      notes: null,
    },
    {
      reference: "DB-DEMO03",
      name: "Demo Patient C",
      email: "demo.c@example.com",
      phone: "+00 000 000 003",
      serviceId: "svc-root-canal",
      serviceTitle: "Root canal treatment",
      dayOffset: 2,
      time: "14:00",
      status: "pending",
      isNewPatient: false,
      notes: null,
    },
    {
      reference: "DB-DEMO04",
      name: "Demo Patient D",
      email: "demo.d@example.com",
      phone: "+00 000 000 004",
      serviceId: "svc-aligners",
      serviceTitle: "Clear aligners",
      dayOffset: 4,
      time: "10:00",
      status: "confirmed",
      isNewPatient: true,
      notes: null,
    },
    {
      reference: "DB-DEMO05",
      name: "Demo Patient E",
      email: "demo.e@example.com",
      phone: "+00 000 000 005",
      serviceId: "svc-pediatric",
      serviceTitle: "Children's dentistry",
      dayOffset: -3,
      time: "15:00",
      status: "completed",
      isNewPatient: true,
      notes: null,
    },
  ];

  return samples.map((sample) => {
    const startsAt = isoForDayOffset(sample.dayOffset, sample.time);
    const endsAt = new Date(new Date(startsAt).getTime() + 30 * 60_000).toISOString();
    return {
      id: `demo-${sample.reference.toLowerCase()}`,
      reference: sample.reference,
      serviceId: sample.serviceId,
      serviceTitle: sample.serviceTitle,
      patientName: sample.name,
      patientEmail: sample.email,
      patientPhone: sample.phone,
      startsAt,
      endsAt,
      status: sample.status,
      isNewPatient: sample.isNewPatient,
      notes: sample.notes,
      internalNote: null,
      source: "demo-seed",
      createdAt: now,
      updatedAt: now,
    } satisfies BookingRecord;
  });
}

export function buildDemoContactMessages(): ContactMessageRecord[] {
  return [
    {
      id: "demo-msg-1",
      name: "Demo Enquiry A",
      email: "demo.enquiry@example.com",
      phone: null,
      subject: "inquiry",
      message: "Sample contact message used to demonstrate the admin inbox. Safe to delete.",
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];
}
