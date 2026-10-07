import type { Metadata } from "next";

import { ResultsGallery } from "@/components/gallery/ResultsGallery";
import { CtaBand } from "@/components/home/CtaBand";
import { MediaPlaceholder, SectionHeading } from "@/components/ui/primitives";
import { galleryPhotos } from "@/content/media";
import { facilityContent } from "@/content/sections";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Dr. Bouamara on television, and treatment results published with the patient's consent.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <main>
      <section className="bg-ink-900 py-16 text-white sm:py-20">
        <div className="container-x">
          <SectionHeading
            tone="dark"
            as="h1"
            eyebrow={facilityContent.eyebrow}
            title={facilityContent.title}
            description={facilityContent.body}
          />
        </div>
      </section>

      <section className="section bg-cream-100">
        <div className="container-x">
          <ul className="grid gap-8">
            {galleryPhotos.map((photo) => (
              <li key={photo.id}>
                <figure className="overflow-hidden rounded-card border border-ink-900/10 bg-white shadow-soft">
                  <MediaPlaceholder
                    src={photo.src}
                    alt={
                      photo.src
                        ? `${photo.title} — Dr. Bouamara during her television interview`
                        : `${photo.title} — photograph pending`
                    }
                    label={photo.title}
                    caption={photo.caption}
                    className="aspect-16/9 w-full bg-cream-50"
                    imageClassName="object-cover"
                    sizes="(min-width: 1024px) 80vw, 100vw"
                  />
                  <figcaption className="flex items-center justify-between gap-4 px-6 py-5">
                    <span className="font-ui text-sm text-ink-800">{photo.title}</span>
                    <span className="font-ui text-xs text-ink-400">
                      {photo.src ? "Photograph" : "Photo pending"}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Treatment results — consented cases only */}
      <ResultsGallery />

      <CtaBand
        title="Prefer to see the clinic in person?"
        description="Request an appointment and the clinic will confirm a time for your visit."
      />
    </main>
  );
}
