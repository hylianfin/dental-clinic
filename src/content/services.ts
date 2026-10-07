import type { Service, ServiceCategory } from "@/types/content";

/**
 * ============================================================================
 *  SERVICE CATALOGUE — DEMO CONTENT
 * ============================================================================
 *  This is a realistic starting catalogue of common dental service types, not
 *  a statement of what Dr. Bouamara Dental Clinic offers. Before launch:
 *    • keep only the treatments the clinic actually provides,
 *    • confirm the duration of each appointment slot,
 *    • add a real photo per service (`image` overrides the image registry in
 *      `src/content/media.ts`).
 *  Copy avoids outcome/efficacy claims on purpose — see README → Content rules.
 * ============================================================================
 */

export const serviceCategories: ServiceCategory[] = [
  { id: "preventive", name: "Preventive care", shortName: "Preventive" },
  { id: "restorative", name: "Restorative dentistry", shortName: "Restorative" },
  { id: "cosmetic", name: "Cosmetic dentistry", shortName: "Cosmetic" },
  { id: "orthodontic", name: "Orthodontics", shortName: "Orthodontics" },
  { id: "pediatric", name: "Children's dentistry", shortName: "Pediatric" },
  { id: "periodontal", name: "Gum care", shortName: "Periodontal" },
  { id: "endodontic", name: "Root canal treatment", shortName: "Endodontic" },
  { id: "surgical", name: "Oral surgery", shortName: "Surgery" },
  { id: "technology", name: "Imaging & digital planning", shortName: "Technology" },
];

export const services: Service[] = [
  {
    id: "svc-checkup",
    slug: "check-up-and-cleaning",
    title: "Check-up & cleaning",
    summary:
      "A routine examination and professional clean, with time to review your oral health and answer questions.",
    category: "preventive",
    details: [
      "Examination of teeth, gums and soft tissues",
      "Professional scaling and polishing",
      "Personalised home-care advice",
      "Findings explained before any treatment",
    ],
    durationMinutes: 45,
    image: null,
    featured: true,
    active: true,
  },
  {
    id: "svc-sealants",
    slug: "dental-sealants",
    title: "Dental sealants",
    summary:
      "A protective coating applied to the chewing surfaces of back teeth to help reduce the risk of decay.",
    category: "preventive",
    details: [
      "Quick, non-invasive appointment",
      "Commonly used for children and teenagers",
      "Applied without drilling",
      "Reviewed at future check-ups",
    ],
    durationMinutes: 30,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-whitening",
    slug: "teeth-whitening",
    title: "Teeth whitening",
    summary:
      "In-clinic whitening or a supervised take-home kit, planned around your enamel and sensitivity.",
    category: "cosmetic",
    details: [
      "Shade assessment before treatment",
      "Sensitivity management plan",
      "In-clinic or take-home option",
      "Aftercare guidance",
    ],
    durationMinutes: 60,
    image: null,
    featured: true,
    active: true,
  },
  {
    id: "svc-bonding",
    slug: "composite-bonding",
    title: "Composite bonding",
    summary:
      "Tooth-coloured composite used to repair small chips, cracks or gaps, usually in a single visit.",
    category: "cosmetic",
    details: [
      "Minimally invasive",
      "Shade-matched to adjacent teeth",
      "Single-visit treatment in most cases",
      "Polished for a natural finish",
    ],
    durationMinutes: 60,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-veneers",
    slug: "veneers",
    title: "Veneers",
    summary:
      "Thin custom-made facings bonded to the front of selected teeth, planned with a treatment preview.",
    category: "cosmetic",
    details: [
      "Case-by-case suitability assessment",
      "Digital or wax-up preview where possible",
      "Custom-shaded restorations",
      "Structured aftercare plan",
    ],
    durationMinutes: 90,
    image: null,
    featured: true,
    active: true,
  },
  {
    id: "svc-implants",
    slug: "dental-implants",
    title: "Dental implants",
    summary:
      "Replacement of a missing tooth using a titanium fixture and a custom crown, planned from 3D imaging.",
    category: "restorative",
    details: [
      "Treatment plan based on 3D imaging",
      "Written plan and phased costs",
      "Healing time explained in advance",
      "Follow-up reviews included",
    ],
    durationMinutes: 90,
    image: null,
    featured: true,
    active: true,
  },
  {
    id: "svc-crowns",
    slug: "crowns",
    title: "Crowns",
    summary:
      "A custom-made cover that restores the shape and function of a heavily restored or cracked tooth.",
    category: "restorative",
    details: [
      "Impression or intra-oral scan",
      "Shade-matched material options",
      "Temporary crown between visits",
      "Fit checked before cementing",
    ],
    durationMinutes: 75,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-bridges",
    slug: "bridges",
    title: "Bridges",
    summary:
      "A fixed restoration that replaces one or more missing teeth by anchoring to neighbouring teeth.",
    category: "restorative",
    details: [
      "Suitability assessed with imaging",
      "Fixed, non-removable option",
      "Cleaning technique explained",
      "Review appointments scheduled",
    ],
    durationMinutes: 75,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-aligners",
    slug: "clear-aligners",
    title: "Clear aligners",
    summary:
      "Removable transparent trays used to gradually move teeth, planned with a digital simulation.",
    category: "orthodontic",
    details: [
      "Digital scan and treatment simulation",
      "Removable and discreet",
      "Wear-time schedule provided",
      "Progress reviews during treatment",
    ],
    durationMinutes: 60,
    image: null,
    featured: true,
    active: true,
  },
  {
    id: "svc-braces",
    slug: "fixed-braces",
    title: "Fixed braces",
    summary: "Metal or ceramic brackets used to move teeth where aligners are not suitable.",
    category: "orthodontic",
    details: [
      "Full assessment before treatment",
      "Typical duration discussed case by case",
      "Scheduled adjustment visits",
      "Retainer plan after treatment",
    ],
    durationMinutes: 60,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-pediatric",
    slug: "childrens-dentistry",
    title: "Children's dentistry",
    summary: "Appointments paced for younger patients, with prevention and habit advice for parents.",
    category: "pediatric",
    details: [
      "Short, unhurried appointments",
      "Prevention-first approach",
      "Fluoride and sealant options",
      "Guidance on brushing and diet",
    ],
    durationMinutes: 30,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-space-maintainers",
    slug: "space-maintainers",
    title: "Space maintainers",
    summary:
      "A small appliance that holds the gap left by an early lost baby tooth until the adult tooth arrives.",
    category: "pediatric",
    details: [
      "Custom-made for the child",
      "Fitted at a short appointment",
      "Cleaning routine explained",
      "Removed once the adult tooth erupts",
    ],
    durationMinutes: 30,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-periodontal",
    slug: "gum-treatment",
    title: "Gum treatment",
    summary: "Assessment and treatment of gum inflammation, including deep cleaning where indicated.",
    category: "periodontal",
    details: [
      "Periodontal charting and measurements",
      "Scaling and root planing where needed",
      "Maintenance interval agreed with you",
      "Home-care technique reviewed",
    ],
    durationMinutes: 60,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-gum-graft",
    slug: "gum-grafting",
    title: "Gum grafting",
    summary: "A surgical procedure used to cover an exposed root surface caused by receding gums.",
    category: "periodontal",
    details: [
      "Referred or performed in-house — to be confirmed",
      "Procedure and healing explained in advance",
      "Aftercare instructions provided",
      "Review appointment included",
    ],
    durationMinutes: 90,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-root-canal",
    slug: "root-canal-treatment",
    title: "Root canal treatment",
    summary: "Treatment of an infected or inflamed tooth pulp, followed by a restoration of the tooth.",
    category: "endodontic",
    details: [
      "Local anaesthesia and isolation",
      "Usually completed across one or two visits",
      "Restoration planned after treatment",
      "Post-treatment review",
    ],
    durationMinutes: 90,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-microsurgery",
    slug: "endodontic-microsurgery",
    title: "Endodontic microsurgery",
    summary: "A precision procedure for selected cases that need treatment at the root tip.",
    category: "endodontic",
    details: [
      "Case selection with 3D imaging",
      "Performed under magnification",
      "Written pre-operative instructions",
      "Healing review appointment",
    ],
    durationMinutes: 90,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-extractions",
    slug: "extractions",
    title: "Extractions",
    summary: "Removal of a tooth that cannot be restored, including wisdom tooth assessment.",
    category: "surgical",
    details: [
      "Imaging before treatment",
      "Local anaesthesia; sedation options to be confirmed",
      "Clear aftercare instructions",
      "Replacement options discussed afterwards",
    ],
    durationMinutes: 45,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-bone-graft",
    slug: "bone-grafting",
    title: "Bone grafting",
    summary: "A procedure that builds up jawbone volume where it is needed before implant placement.",
    category: "surgical",
    details: [
      "Planned from 3D imaging",
      "Material options explained",
      "Healing timeline provided",
      "Reviewed before implant surgery",
    ],
    durationMinutes: 90,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-3d-imaging",
    slug: "3d-imaging",
    title: "3D imaging (CBCT)",
    summary: "Three-dimensional scanning used for diagnosis and treatment planning where indicated.",
    category: "technology",
    details: [
      "Requested only when clinically indicated",
      "Low-dose protocols",
      "Images reviewed with you",
      "Supports implant and surgical planning",
    ],
    durationMinutes: 20,
    image: null,
    featured: false,
    active: true,
  },
  {
    id: "svc-digital-smile",
    slug: "digital-smile-planning",
    title: "Digital smile planning",
    summary: "A digital preview used to agree on the shape and proportion of front teeth before treatment.",
    category: "technology",
    details: [
      "Photographs and scans",
      "Preview discussed with you",
      "Adjustments before any treatment",
      "Guides the final restorations",
    ],
    durationMinutes: 45,
    image: null,
    featured: false,
    active: true,
  },
];

/** Services shown on the home page. */
export const featuredServices = (): Service[] => services.filter((service) => service.featured);

export const findServiceBySlug = (slug: string): Service | undefined =>
  services.find((service) => service.slug === slug);

export const categoryName = (id: Service["category"]): string =>
  serviceCategories.find((category) => category.id === id)?.name ?? "Service";
