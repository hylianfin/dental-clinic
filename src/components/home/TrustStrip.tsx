import { RiShieldCheckLine, RiTimeLine, RiFileTextLine, RiHeartPulseLine } from "react-icons/ri";

import { Reveal } from "@/components/ui/Reveal";
import { trustPoints } from "@/content/sections";

const ICONS = [RiTimeLine, RiFileTextLine, RiShieldCheckLine, RiHeartPulseLine] as const;

/** Four service promises, straight from the content file. */
export function TrustStrip() {
  return (
    <section className="border-b border-ink-900/8 bg-cream-100 py-14">
      <div className="container-x">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point, index) => {
            const Icon = ICONS[index % ICONS.length] ?? RiTimeLine;
            return (
              <Reveal as="li" key={point.id} delay={index * 70} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-ink/25 bg-white text-gold-ink"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg text-ink-900">{point.title}</h3>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-ink-600">
                    {point.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
