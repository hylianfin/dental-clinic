/**
 * Human-readable appointment references, e.g. `DB-8F3K2Q`.
 *
 * Generated with the Web Crypto API (available in Node 20+ and browsers) so no
 * extra dependency is needed. Uniqueness is additionally enforced by a unique
 * constraint on `appointments.reference` in the database.
 */

/** Crockford-style alphabet: no I, L, O or U to avoid misreading over the phone. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateAppointmentReference(prefix = "DB", length = 6): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);

  let output = "";
  for (const byte of bytes) {
    output += ALPHABET[byte % ALPHABET.length];
  }
  return `${prefix}-${output}`;
}

/** Normalises user-typed references for lookup (case- and space-insensitive). */
export function normaliseReference(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}
