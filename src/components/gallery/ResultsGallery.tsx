import { Alert, MediaPlaceholder } from "@/components/ui/primitives";
import { results, resultsDisclaimer } from "@/content/media";

/**
 * Treatment results (before / after).
 *
 * Rendered only for cases with `consentOnFile: true` — the clinic confirmed
 * that documented consent exists for the material supplied. Captions are
 * neutral: no treatment counts, durations or outcome claims are stated, because
 * none were provided.
 *
 * A case can be a pair (`before` + `after`) or one ready-made composite.
 */
export function ResultsGallery() {
  const publishable = results.filter((item) => item.consentOnFile);
  if (publishable.length === 0) return null;

  const missing = publishable.every(
    (item) => !item.before && !item.after && !item.composite,
  );

  return (
    <section className="section bg-white" aria-labelledby="results-heading">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Treatment results</p>
            <h2
              id="results-heading"
              className="mt-4 font-heading text-3xl text-ink-900 sm:text-4xl"
            >
              Before &amp; after
            </h2>
            <p className="mt-4 max-w-prose font-body text-base leading-relaxed text-ink-600">
              Clinical photographs from the practice, published with the patient&apos;s consent.
            </p>
          </div>
        </div>

        {missing && (
          <Alert tone="info" className="mt-8" title="Photographs are being prepared">
            The cases below are ready to display and consent is recorded. The image files still need
            to be added to <code className="font-mono text-xs">public/media/results/</code> and
            referenced in <code className="font-mono text-xs">src/content/media.ts</code>.
          </Alert>
        )}

        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {publishable.map((item) => (
            <li key={item.id}>
              <figure className="card overflow-hidden">
                {item.before || item.after ? (
                  <div className="grid grid-cols-2 gap-px bg-ink-900/10">
                    <div className="relative">
                      <MediaPlaceholder
                        src={item.before}
                        alt={`${item.title} — before treatment`}
                        label="Before"
                        caption="Photo pending"
                        className="aspect-4/3 w-full"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-ink-900/80 px-3 py-1 font-ui text-[0.625rem] font-semibold uppercase tracking-wider text-white">
                        Before
                      </span>
                    </div>
                    <div className="relative">
                      <MediaPlaceholder
                        src={item.after}
                        alt={`${item.title} — after treatment`}
                        label="After"
                        caption="Photo pending"
                        className="aspect-4/3 w-full"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 font-ui text-[0.625rem] font-semibold uppercase tracking-wider text-ink-900">
                        After
                      </span>
                    </div>
                  </div>
                ) : (
                  <MediaPlaceholder
                    src={item.composite}
                    alt={`${item.title} — before and after treatment`}
                    label={item.title}
                    caption="Photo pending"
                    /* The sheets are the clinic's own layouts and differ in
                       shape, so the whole photograph is shown rather than
                       cropped to fill a fixed frame. */
                    className="aspect-square w-full bg-cream-50"
                    imageClassName="object-contain"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                )}

                <figcaption className="flex items-start justify-between gap-4 p-5">
                  <span>
                    <span className="block font-heading text-lg text-ink-900">{item.title}</span>
                    <span className="mt-1 block font-body text-xs text-ink-500">
                      {item.caption}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-ink-900/12 px-2.5 py-1 font-ui text-[0.625rem] font-semibold uppercase tracking-wider text-ink-500">
                    Consented
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-3xl font-body text-xs leading-relaxed text-ink-500">
          {resultsDisclaimer}
        </p>
      </div>
    </section>
  );
}
