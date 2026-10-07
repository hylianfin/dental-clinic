/**
 * Content types for the site layer.
 *
 * Everything the public site renders comes from `src/content/*`, which is the
 * single source of truth. When Supabase is connected these records can be
 * loaded from the database instead (see `src/lib/queries/*`), with these files
 * acting as the offline/demo fallback.
 */

export type ServiceCategoryId =
  | "preventive"
  | "restorative"
  | "cosmetic"
  | "orthodontic"
  | "pediatric"
  | "periodontal"
  | "endodontic"
  | "surgical"
  | "technology";

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  /** Short localised label used in the admin dashboard. */
  shortName: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ServiceCategoryId;
  /** Bullet list shown on the services page. Keep factual, no outcome claims. */
  details: string[];
  /** Optional duration hint used to size booking slots. */
  durationMinutes: number;
  /**
   * Optional image URL. `null` renders a branded placeholder, so the site
   * never shows a broken image while real photography is pending.
   */
  image: string | null;
  featured: boolean;
  active: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Credentials must only be filled in with verified information. */
  credentials: string | null;
  bio: string | null;
  image: string | null;
  /** `true` when every remaining field still needs real clinic data. */
  isPlaceholder: boolean;
}

export interface Testimonial {
  id: string;
  /** Only publish reviews with documented patient consent. */
  author: string;
  role: string | null;
  quote: string;
  rating: number;
  approved: boolean;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Answers that still need the clinic's real policy. */
  isPlaceholder: boolean;
}

export interface OpeningHours {
  /** 0 = Sunday … 6 = Saturday (matches JavaScript Date#getDay). */
  weekday: number;
  label: string;
  /** e.g. { open: "09:00", close: "18:00" } — null until confirmed. */
  open: string | null;
  close: string | null;
  closed: boolean;
}

/**
 * A television / radio / press appearance.
 *
 * Only fields the clinic actually supplied are populated — no channel name,
 * broadcast date or description is guessed.
 */
export interface MediaAppearance {
  id: string;
  /** Programme name, as provided. */
  program: string;
  /** Topic, in the wording provided (may be Arabic). */
  topic: string;
  /** English rendering of the topic, shown as supporting text. */
  topicTranslation: string | null;
  /** Official video link. `null` renders a clearly-marked pending state. */
  videoUrl: string | null;
  /** Optional still. See `src/content/media.ts`. */
  thumbnail: string | null;
  /** `true` while the video link has not been supplied. */
  isPlaceholder: boolean;
}
