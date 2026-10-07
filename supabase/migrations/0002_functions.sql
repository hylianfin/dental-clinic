-- ============================================================================
--  0002 — Functions, triggers and the double-booking guard
-- ============================================================================

-- ------------------------------------------------------------- helpers ----

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_touch_updated_at on public.services;
create trigger services_touch_updated_at
  before update on public.services
  for each row execute function public.touch_updated_at();

drop trigger if exists opening_hours_touch_updated_at on public.opening_hours;
create trigger opening_hours_touch_updated_at
  before update on public.opening_hours
  for each row execute function public.touch_updated_at();

drop trigger if exists staff_profiles_touch_updated_at on public.staff_profiles;
create trigger staff_profiles_touch_updated_at
  before update on public.staff_profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists appointments_touch_updated_at on public.appointments;
create trigger appointments_touch_updated_at
  before update on public.appointments
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------- authorisation ----

-- Is the caller an active staff member?
-- SECURITY DEFINER so the check is not blocked by RLS on staff_profiles.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = auth.uid()
      and active
  );
$$;

-- Is the caller an active admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = auth.uid()
      and active
      and role = 'admin'
  );
$$;

revoke all on function public.is_staff() from anon, public;
revoke all on function public.is_admin() from anon, public;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------- double-booking guard ----

-- Two blocking appointments can never overlap, even if two requests are
-- processed at the same instant. The application still checks availability
-- first, so patients get a friendly message; this constraint is the backstop.
--
-- Requires btree_gist (created in 0001).
drop index if exists appointments_no_overlap;

alter table public.appointments
  drop constraint if exists appointments_no_overlap;

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

-- ------------------------------------------------------------- auditing ----

create or replace function public.log_appointment_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.appointment_events (appointment_id, actor_id, action, detail)
    values (new.id, auth.uid(), 'created', jsonb_build_object('status', new.status, 'source', new.source));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.appointment_events (appointment_id, actor_id, action, detail)
    values (
      new.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists appointments_audit on public.appointments;
create trigger appointments_audit
  after insert or update on public.appointments
  for each row execute function public.log_appointment_event();

-- ------------------------------------------------- patient-safe views ------
--
-- Anonymous visitors need to know which times are taken in order to see
-- availability — but must never see patient details. These views expose ONLY
-- time ranges. They intentionally run with the owner's privileges
-- (security_invoker = false, the default) so they bypass the RLS policies that
-- protect the underlying tables.

create or replace view public.appointment_slots as
  select starts_at, ends_at
  from public.appointments
  where status in ('pending', 'confirmed')
    and ends_at > now();

create or replace view public.time_off_slots as
  select starts_at, ends_at
  from public.time_off
  where ends_at > now();

comment on view public.appointment_slots is
  'Time ranges only — no patient data. Used by the public availability engine.';
comment on view public.time_off_slots is
  'Clinic closures as time ranges only. Used by the public availability engine.';

revoke all on public.appointment_slots from anon, authenticated;
revoke all on public.time_off_slots from anon, authenticated;
grant select on public.appointment_slots to anon, authenticated;
grant select on public.time_off_slots to anon, authenticated;
