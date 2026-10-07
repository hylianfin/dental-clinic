COUNT 20
-- ============================================================================
--  0004 - Seed data (DEMO VALUES)
--
--  Opening hours are DEMO values, not the clinic's real hours. They are stored
--  here so the booking engine has a schedule to work with; replace them in
--  Admin -> Opening hours (or edit this file) once the clinic confirms them.
-- ============================================================================

insert into public.opening_hours (weekday, label, opens_at, closes_at, closed) values
  (0, 'Sunday',    '09:00', '17:00', false),
  (1, 'Monday',    '09:00', '17:00', false),
  (2, 'Tuesday',   '09:00', '17:00', false),
  (3, 'Wednesday', '09:00', '17:00', false),
  (4, 'Thursday',  '09:00', '17:00', false),
  (5, 'Friday',    null,    null,    true),
  (6, 'Saturday',  '09:00', '13:00', false)
on conflict (weekday) do update
  set label = excluded.label,
      opens_at = excluded.opens_at,
      closes_at = excluded.closes_at,
      closed = excluded.closed;

-- Service catalogue. Review before launch: keep only treatments the clinic
-- actually provides and confirm each duration.
insert into public.services (slug, title, summary, category, details, duration_minutes, featured, active, sort_order) values
  ('check-up-and-cleaning', 'Check-up & cleaning', 'A routine examination and professional clean, with time to review your oral health and answer questions.', 'preventive', array['Examination of teeth, gums and soft tissues', 'Professional scaling and polishing', 'Personalised home-care advice', 'Findings explained before any treatment']::text[], 45, true, true, 10),
  ('dental-sealants', 'Dental sealants', 'A protective coating applied to the chewing surfaces of back teeth to help reduce the risk of decay.', 'preventive', array['Quick, non-invasive appointment', 'Commonly used for children and teenagers', 'Applied without drilling', 'Reviewed at future check-ups']::text[], 30, false, true, 20),
  ('teeth-whitening', 'Teeth whitening', 'In-clinic whitening or a supervised take-home kit, planned around your enamel and sensitivity.', 'cosmetic', array['Shade assessment before treatment', 'Sensitivity management plan', 'In-clinic or take-home option', 'Aftercare guidance']::text[], 60, true, true, 30),
  ('composite-bonding', 'Composite bonding', 'Tooth-coloured composite used to repair small chips, cracks or gaps, usually in a single visit.', 'cosmetic', array['Minimally invasive', 'Shade-matched to adjacent teeth', 'Single-visit treatment in most cases', 'Polished for a natural finish']::text[], 60, false, true, 40),
  ('veneers', 'Veneers', 'Thin custom-made facings bonded to the front of selected teeth, planned with a treatment preview.', 'cosmetic', array['Case-by-case suitability assessment', 'Digital or wax-up preview where possible', 'Custom-shaded restorations', 'Structured aftercare plan']::text[], 90, true, true, 50),
  ('dental-implants', 'Dental implants', 'Replacement of a missing tooth using a titanium fixture and a custom crown, planned from 3D imaging.', 'restorative', array['Treatment plan based on 3D imaging', 'Written plan and phased costs', 'Healing time explained in advance', 'Follow-up reviews included']::text[], 90, true, true, 60),
  ('crowns', 'Crowns', 'A custom-made cover that restores the shape and function of a heavily restored or cracked tooth.', 'restorative', array['Impression or intra-oral scan', 'Shade-matched material options', 'Temporary crown between visits', 'Fit checked before cementing']::text[], 75, false, true, 70),
  ('bridges', 'Bridges', 'A fixed restoration that replaces one or more missing teeth by anchoring to neighbouring teeth.', 'restorative', array['Suitability assessed with imaging', 'Fixed, non-removable option', 'Cleaning technique explained', 'Review appointments scheduled']::text[], 75, false, true, 80),
  ('clear-aligners', 'Clear aligners', 'Removable transparent trays used to gradually move teeth, planned with a digital simulation.', 'orthodontic', array['Digital scan and treatment simulation', 'Removable and discreet', 'Wear-time schedule provided', 'Progress reviews during treatment']::text[], 60, true, true, 90),
  ('fixed-braces', 'Fixed braces', 'Metal or ceramic brackets used to move teeth where aligners are not suitable.', 'orthodontic', array['Full assessment before treatment', 'Typical duration discussed case by case', 'Scheduled adjustment visits', 'Retainer plan after treatment']::text[], 60, false, true, 100),
  ('childrens-dentistry', 'Children''s dentistry', 'Appointments paced for younger patients, with prevention and habit advice for parents.', 'pediatric', array['Short, unhurried appointments', 'Prevention-first approach', 'Fluoride and sealant options', 'Guidance on brushing and diet']::text[], 30, false, true, 110),
  ('space-maintainers', 'Space maintainers', 'A small appliance that holds the gap left by an early lost baby tooth until the adult tooth arrives.', 'pediatric', array['Custom-made for the child', 'Fitted at a short appointment', 'Cleaning routine explained', 'Removed once the adult tooth erupts']::text[], 30, false, true, 120),
  ('gum-treatment', 'Gum treatment', 'Assessment and treatment of gum inflammation, including deep cleaning where indicated.', 'periodontal', array['Periodontal charting and measurements', 'Scaling and root planing where needed', 'Maintenance interval agreed with you', 'Home-care technique reviewed']::text[], 60, false, true, 130),
  ('gum-grafting', 'Gum grafting', 'A surgical procedure used to cover an exposed root surface caused by receding gums.', 'periodontal', array['Referred or performed in-house — to be confirmed', 'Procedure and healing explained in advance', 'Aftercare instructions provided', 'Review appointment included']::text[], 90, false, true, 140),
  ('root-canal-treatment', 'Root canal treatment', 'Treatment of an infected or inflamed tooth pulp, followed by a restoration of the tooth.', 'endodontic', array['Local anaesthesia and isolation', 'Usually completed across one or two visits', 'Restoration planned after treatment', 'Post-treatment review']::text[], 90, false, true, 150),
  ('endodontic-microsurgery', 'Endodontic microsurgery', 'A precision procedure for selected cases that need treatment at the root tip.', 'endodontic', array['Case selection with 3D imaging', 'Performed under magnification', 'Written pre-operative instructions', 'Healing review appointment']::text[], 90, false, true, 160),
  ('extractions', 'Extractions', 'Removal of a tooth that cannot be restored, including wisdom tooth assessment.', 'surgical', array['Imaging before treatment', 'Local anaesthesia; sedation options to be confirmed', 'Clear aftercare instructions', 'Replacement options discussed afterwards']::text[], 45, false, true, 170),
  ('bone-grafting', 'Bone grafting', 'A procedure that builds up jawbone volume where it is needed before implant placement.', 'surgical', array['Planned from 3D imaging', 'Material options explained', 'Healing timeline provided', 'Reviewed before implant surgery']::text[], 90, false, true, 180),
  ('3d-imaging', '3D imaging (CBCT)', 'Three-dimensional scanning used for diagnosis and treatment planning where indicated.', 'technology', array['Requested only when clinically indicated', 'Low-dose protocols', 'Images reviewed with you', 'Supports implant and surgical planning']::text[], 20, false, true, 190),
  ('digital-smile-planning', 'Digital smile planning', 'A digital preview used to agree on the shape and proportion of front teeth before treatment.', 'technology', array['Photographs and scans', 'Preview discussed with you', 'Adjustments before any treatment', 'Guides the final restorations']::text[], 45, false, true, 200)
on conflict (slug) do update
  set title = excluded.title,
      summary = excluded.summary,
      category = excluded.category,
      details = excluded.details,
      duration_minutes = excluded.duration_minutes,
      featured = excluded.featured,
      sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
--  First staff account
--
--  1. Create the user:  Dashboard -> Authentication -> Users -> Add user
--     (set a strong password and confirm the email).
--  2. Copy the user's UUID and run:
--
--     insert into public.staff_profiles (user_id, full_name, role, active)
--     values ('<paste-user-uuid>', 'Dr. Bouamara', 'admin', true)
--     on conflict (user_id) do update set role = 'admin', active = true;
--
--  Until this row exists, the account can sign in but /admin stays locked.
-- ---------------------------------------------------------------------------

