import Link from "next/link";

import { Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { navigation } from "@/content/site";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="section container-x">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <Eyebrow>404</Eyebrow>
        <SectionHeading
          as="h1"
          align="center"
          title="We couldn't find that page"
          description="The link may be out of date, or the page has moved. Here are the main sections instead."
          className="mt-4"
        />

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/appointment" className="btn-outline">
            Request an appointment
          </Link>
        </div>

        <nav aria-label="Site sections" className="mt-10 w-full">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {navigation.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full items-center justify-center rounded-xl border border-ink-900/10 bg-white px-4 py-4 font-ui text-sm text-ink-800 transition-colors hover:border-brand-700/40 hover:text-brand-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
