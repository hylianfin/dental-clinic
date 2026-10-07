import { RiPlayCircleLine, RiExternalLinkLine } from "react-icons/ri";

import { PlaceholderBadge, SectionHeading } from "@/components/ui/primitives";
import { MediaPlaceholder } from "@/components/ui/primitives";
import { mediaAppearances } from "@/content/sections";

/**
 * Television appearance.
 *
 * Only what the clinic supplied is shown: the programme name and the topic.
 * No channel, broadcast date, description or embed — and the video opens on
 * YouTube in a new tab rather than being embedded, as requested.
 *
 * When the official link is added to
 * `src/content/sections.ts → mediaAppearances[].videoUrl`, the button becomes
 * live automatically; until then it renders a clearly-marked pending state.
 */
export function MediaAppearanceSection() {
  const appearances = mediaAppearances;
  if (appearances.length === 0) return null;

  return (
    <section className="section bg-white" aria-labelledby="media-appearance-heading">
      <div className="container-x">
        <SectionHeading
          eyebrow="On air"
          title="Dr. Bouamara on television"
          description="Dr. Messaouda Bouamara speaking about dentistry and sport."
        />

        <div className="mt-12 space-y-6">
          {appearances.map((appearance) => {
            const hasVideo = Boolean(appearance.videoUrl);

            return (
              <article
                key={appearance.id}
                className="grid overflow-hidden rounded-card border border-ink-900/10 bg-cream-50 shadow-soft lg:grid-cols-[0.85fr_1.15fr]"
              >
                <MediaPlaceholder
                  src={appearance.thumbnail}
                  alt={`Still from the ${appearance.program} appearance`}
                  label={appearance.program}
                  caption="Still pending"
                  className="min-h-[15rem] w-full lg:min-h-full"
                  icon="▶"
                  sizes="(min-width: 1024px) 35vw, 100vw"
                />

                <div className="flex flex-col justify-center p-7 lg:p-10">
                  <p className="eyebrow">Television appearance</p>

                  <h3
                    id="media-appearance-heading"
                    className="mt-3 font-heading text-3xl text-ink-900 sm:text-4xl"
                  >
                    {appearance.program}
                  </h3>

                  <div
                    className="mt-5 border-l-2 border-gold ps-4"
                    dir="auto"
                  >
                    <p className="font-heading text-2xl leading-snug text-ink-800">
                      {appearance.topic}
                    </p>
                    {appearance.topicTranslation && (
                      <p className="mt-2 font-body text-sm text-ink-500">
                        {appearance.topicTranslation}
                      </p>
                    )}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    {hasVideo ? (
                      <a
                        href={appearance.videoUrl as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        <RiPlayCircleLine aria-hidden="true" className="h-4 w-4" />
                        Watch the interview
                        <RiExternalLinkLine aria-hidden="true" className="h-3.5 w-3.5" />
                        <span className="sr-only">(opens YouTube in a new tab)</span>
                      </a>
                    ) : (
                      <span
                        aria-disabled="true"
                        className="btn-primary cursor-not-allowed opacity-50"
                        title="The official video link has not been supplied yet."
                      >
                        <RiPlayCircleLine aria-hidden="true" className="h-4 w-4" />
                        Watch the interview
                      </span>
                    )}

                    {!hasVideo && <PlaceholderBadge label="Video link pending" />}
                  </div>

                  {!hasVideo && (
                    <p className="mt-4 max-w-md font-body text-xs leading-relaxed text-ink-500">
                      The official video link has not been supplied yet. Once it is added, this
                      button opens the interview on YouTube in a new tab.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
