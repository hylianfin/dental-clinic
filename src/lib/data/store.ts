import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * File-backed JSON store used ONLY when Supabase is not configured.
 *
 * Purpose: the booking flow, contact inbox and admin dashboard must be fully
 * demonstrable out of the box. Every record written here is flagged
 * `demoMode` in the UI so demo data can never be mistaken for real bookings.
 *
 * Behaviour notes:
 *  - Writes are best-effort: on a read-only filesystem (e.g. Vercel) the store
 *    degrades to in-memory for the lifetime of the process instead of throwing.
 *  - `.data/` is git-ignored.
 */

const DATA_DIR = path.join(process.cwd(), ".data");

const memoryStore = new Map<string, unknown>();

async function ensureDir(): Promise<boolean> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export async function readCollection<T>(file: string, fallback: T): Promise<T> {
  const memory = memoryStore.get(file);
  if (memory !== undefined) return memory as T;

  try {
    const raw = await readFile(path.join(DATA_DIR, file), "utf8");
    const parsed = JSON.parse(raw) as T;
    memoryStore.set(file, parsed);
    return parsed;
  } catch {
    memoryStore.set(file, fallback);
    return fallback;
  }
}

export async function writeCollection<T>(file: string, value: T): Promise<void> {
  memoryStore.set(file, value);
  try {
    const writable = await ensureDir();
    if (!writable) return;
    await writeFile(path.join(DATA_DIR, file), JSON.stringify(value, null, 2), "utf8");
  } catch {
    // Read-only environment — the in-memory copy keeps the current session working.
  }
}
