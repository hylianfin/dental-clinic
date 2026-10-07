"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Eyebrow, SectionHeading } from "@/components/ui/primitives";

/** Route-level error boundary (client component by Next.js requirement). */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your monitoring provider (Sentry, etc.) when available.
    console.error("[route-error]", error);
  }, [error]);

  return (
    <main className="section container-x">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <Eyebrow>Something went wrong</Eyebrow>
        <SectionHeading
          as="h1"
          align="center"
          title="That page didn't load"
          description="The problem has been logged. You can try again, or use one of the links below."
          className="mt-4"
        />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-outline">
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 font-mono text-xs text-ink-400">Reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
