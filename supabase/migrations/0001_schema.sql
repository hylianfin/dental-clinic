-- ============================================================================
--  0001 — Schema: Dr. Bouamara Dental Clinic
--  Run order: 0001 → 0002 → 0003 → 0004
--
--  Apply with the Supabase SQL editor, or:
--    supabase db push
--
--  Design notes
--   • Every instant is `timestamptz` stored in UTC; the clinic's local hours
--     are interpreted by the application using NEXT_PUBLIC_CLINIC_TIME_ZONE.
--   • Double-booking is prevented in the database (see 0002), not only in code.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------- enums ----
do $$
begin
  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum
      ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
  end if;

  if not exists (select 1 from pg_type where typname = 'contact_status') then
    create type public.contact_status as enum
      ('new', 'in_progress', 'resolved', 'spam');
  end if;

  if not exists (select 1 from pg_type where typname = 'staff_role') then
    create type public.staff_role as enum ('admin', 'staff');
  end if;
end $$;

-- --------------------------------------------------------------- tables ----

-- Services offered by the clinic. Drives /services and the booking form.
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  summary          text not null default '',
  category         text not null default 'preventive',
  details          text[] not null default '{}',
  duration_minutes integer not null default 30 check (duration_minutes between 10 and 480),
  price_note       text,
  image_url        text,
  featured         boolean not null default false,
  active           boolean not null default true,
  sort_order       integer not null default 100,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists services_active_idx on public.services (active, sort_order);

-- Weekly opening hours. weekday: 0 = Sunday … 6 = Saturday.
create table if not exists public.opening_hours (
  id         uuid primary key default gen_random_uuid(),
  weekday    integer not null unique check (weekday between 0 and 6),
  label      text not null,
  opens_at   time,
  closes_at  time,
  closed     boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint opening_hours_range_valid check (
    closed = true or (opens_at is not null and closes_at is not null and closes_at > opens_at)
  )
);

-- One-off closures / holidays.
create table if not exists public.time_off (
  id         uuid primary key default gen_random_uuid(),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  reason     text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint time_off_range_valid check (ends_at > starts_at)
);

create index if not exists time_off_range_idx on public.time_off (starts_at, ends_at);

-- Staff allow-list. A user must have an ACTIVE row here to open /admin.
-- Roles live in this table (not in JWT metadata) so access can be revoked
-- instantly without waiting for a token to expire.
create table if not exists public.staff_profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  role       public.staff_role not null default 'staff',
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Appointment requests.
create table if not exists public.appointments (
  id             uuid primary key default gen_random_uuid(),
  reference      text not null unique default ('DB-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8))),
  service_id     uuid references public.services (id) on delete set null,
  patient_name   text not null check (length(btrim(patient_name)) between 2 and 120),
  patient_email  text not null check (position('@' in patient_email) > 1),
  patient_phone  text not null check (length(btrim(patient_phone)) between 6 and 32),
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  status         public.appointment_status not null default 'pending',
  is_new_patient boolean not null default true,
  notes          text check (notes is null or length(notes) <= 1000),
  internal_note  text check (internal_note is null or length(internal_note) <= 2000),
  locale         text,
  source         text not null default 'website',
  cancelled_reason text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint appointments_range_valid check (ends_at > starts_at),
  constraint appointments_not_in_past check (starts_at > now() - interval '1 day')
);

create index if not exists appointments_starts_at_idx on public.appointments (starts_at desc);
create index if not exists appointments_status_idx on public.appointments (status);
create index if not exists appointments_email_idx on public.appointments (lower(patient_email));

-- Contact form submissions.
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) between 2 and 120),
  email      text not null check (position('@' in email) > 1),
  phone      text,
  subject    text not null default 'inquiry',
  message    text not null check (length(btrim(message)) between 10 and 4000),
  status     public.contact_status not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

-- Audit trail for staff actions on appointments (append-only).
create table if not exists public.appointment_events (
  id             bigserial primary key,
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  actor_id       uuid references auth.users (id) on delete set null,
  action         text not null,
  detail         jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists appointment_events_appointment_idx
  on public.appointment_events (appointment_id, created_at desc);
