-- ============================================================================
--  0003 — Row Level Security
--
--  Principle: the browser talks to Supabase with the anon key, so every table
--  must be safe on its own. Nothing is protected by "the UI doesn't show it".
--
--  Summary
--   services          : public read (active rows)      | staff full write
--   opening_hours     : public read                    | staff full write
--   time_off          : staff read/write (ranges are also exposed via view)
--   appointments      : anonymous INSERT only, pending | staff full read/write
--   contact_messages  : anonymous INSERT only          | staff read/update
--   staff_profiles    : self read                      | admin full write
--   appointment_events: staff read, system write
-- ============================================================================

alter table public.services            enable row level security;
alter table public.opening_hours       enable row level security;
alter table public.time_off            enable row level security;
alter table public.staff_profiles      enable row level security;
alter table public.appointments        enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.appointment_events  enable row level security;

-- Force RLS even for the table owner (except service_role, which is exempt) —
-- protects against accidental exposure through a permissive owner role.
alter table public.appointments       force row level security;
alter table public.contact_messages   force row level security;
alter table public.staff_profiles     force row level security;

-- --------------------------------------------------------------- services ---

drop policy if exists services_public_read on public.services;
create policy services_public_read
  on public.services for select
  to anon, authenticated
  using (active = true);

drop policy if exists services_staff_read_all on public.services;
create policy services_staff_read_all
  on public.services for select
  to authenticated
  using (public.is_staff());

drop policy if exists services_staff_write on public.services;
create policy services_staff_write
  on public.services for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------- opening_hours ---

drop policy if exists opening_hours_public_read on public.opening_hours;
create policy opening_hours_public_read
  on public.opening_hours for select
  to anon, authenticated
  using (true);

drop policy if exists opening_hours_staff_write on public.opening_hours;
create policy opening_hours_staff_write
  on public.opening_hours for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------- time_off ---

drop policy if exists time_off_staff_all on public.time_off;
create policy time_off_staff_all
  on public.time_off for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ------------------------------------------------------------ appointments ---

-- Patients may create a request, and only as "pending". They can never read a
-- row back, so no patient data is exposed to other visitors.
drop policy if exists appointments_public_insert on public.appointments;
create policy appointments_public_insert
  on public.appointments for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and source in ('website', 'website-demo')
    and length(btrim(patient_name)) between 2 and 120
    and length(btrim(patient_phone)) between 6 and 32
    and position('@' in patient_email) > 1
  );

drop policy if exists appointments_staff_select on public.appointments;
create policy appointments_staff_select
  on public.appointments for select
  to authenticated
  using (public.is_staff());

drop policy if exists appointments_staff_update on public.appointments;
create policy appointments_staff_update
  on public.appointments for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists appointments_staff_delete on public.appointments;
create policy appointments_staff_delete
  on public.appointments for delete
  to authenticated
  using (public.is_staff());

-- -------------------------------------------------------- contact_messages ---

drop policy if exists contact_messages_public_insert on public.contact_messages;
create policy contact_messages_public_insert
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    status = 'new'
    and length(btrim(message)) between 10 and 4000
    and position('@' in email) > 1
  );

drop policy if exists contact_messages_staff_read on public.contact_messages;
create policy contact_messages_staff_read
  on public.contact_messages for select
  to authenticated
  using (public.is_staff());

drop policy if exists contact_messages_staff_update on public.contact_messages;
create policy contact_messages_staff_update
  on public.contact_messages for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------- staff_profiles ---

-- A signed-in user may read their own row (needed to resolve their role);
-- only admins may manage the allow-list.
drop policy if exists staff_profiles_self_read on public.staff_profiles;
create policy staff_profiles_self_read
  on public.staff_profiles for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists staff_profiles_admin_write on public.staff_profiles;
create policy staff_profiles_admin_write
  on public.staff_profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------- appointment_events ---

drop policy if exists appointment_events_staff_read on public.appointment_events;
create policy appointment_events_staff_read
  on public.appointment_events for select
  to authenticated
  using (public.is_staff());

drop policy if exists appointment_events_staff_insert on public.appointment_events;
create policy appointment_events_staff_insert
  on public.appointment_events for insert
  to authenticated
  with check (public.is_staff());

-- ------------------------------------------------------------- privileges ---
-- anon must never be able to read the appointment table directly, even if a
-- policy is accidentally loosened later: the safe path is the *_slots views.
revoke all on table public.appointments from anon;
grant insert on table public.appointments to anon;

revoke all on table public.contact_messages from anon;
grant insert on table public.contact_messages to anon;

revoke all on table public.appointment_events from anon;
revoke all on table public.staff_profiles from anon;
revoke all on table public.time_off from anon;
