"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Progressive-enhancement reveal.
 *
 * The server-rendered markup is fully visible (no `opacity: 0` in the HTML), so
 * content is never hidden from crawlers, no-JS visitors or a broken bundle.
 * Once JavaScript runs, below-the-fold content fades in as it scrolls into view.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"visible" | "pending" | "hidden">("visible");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Honour reduced-motion and very old browsers: stay visible.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") return;

    // Already on screen at mount → no entrance animation, avoids a flash.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState("pending");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("hidden");
            // Force a reflow-free transition on the next frame.
            requestAnimationFrame(() => setState("visible"));
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hidden = state === "pending" || state === "hidden";

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- polymorphic ref
      ref={ref as any}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-premium",
        hidden && "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
