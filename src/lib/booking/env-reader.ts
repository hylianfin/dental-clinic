/**
 * Reads a public env var without importing `server-only` modules, so this file
 * can be used from Client Components too.
 */
export function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
