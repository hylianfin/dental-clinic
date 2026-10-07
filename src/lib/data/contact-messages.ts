import "server-only";

import type { ContactMessageRecord } from "@/lib/booking/types";
import { buildDemoContactMessages } from "@/lib/data/demo-seed";
import { readCollection, writeCollection } from "@/lib/data/store";

const FILE = "contact-messages.json";

export async function listDemoContactMessages(): Promise<ContactMessageRecord[]> {
  const records = await readCollection<ContactMessageRecord[]>(FILE, []);
  if (records.length > 0) return records;

  const seeded = buildDemoContactMessages();
  await writeCollection(FILE, seeded);
  return seeded;
}

export async function createDemoContactMessage(
  record: ContactMessageRecord,
): Promise<ContactMessageRecord> {
  const records = await listDemoContactMessages();
  await writeCollection(FILE, [...records, record]);
  return record;
}

export async function markDemoContactMessageRead(
  id: string,
  read = true,
): Promise<ContactMessageRecord | null> {
  const records = await listDemoContactMessages();
  let updated: ContactMessageRecord | null = null;

  const next = records.map((record) => {
    if (record.id !== id) return record;
    updated = { ...record, read };
    return updated;
  });

  if (updated) await writeCollection(FILE, next);
  return updated;
}
