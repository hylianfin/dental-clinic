# Supabase setup

The application runs **without** Supabase (content files + a local demo store).
Follow these steps to switch on the real backend, real authentication and the
persisted appointment system.

## 1. Create the project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL**, **anon key** and **service_role key** from
   *Project Settings → API*.
3. Put them in `.env.local` (never commit real keys):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"   # server-only
NEXT_PUBLIC_CLINIC_TIME_ZONE="Africa/Algiers"
```

## 2. Apply the migrations

Run these files in order in the Supabase SQL editor, or with the Supabase CLI:

| File | Contents |
|---|---|
| `migrations/0001_schema.sql` | Tables, enums, indexes, constraints |
| `migrations/0002_functions.sql` | Authorisation helpers, triggers, the DB-level double-booking guard, patient-safe views |
| `migrations/0003_rls.sql` | Row Level Security policies and grants |
| `migrations/0004_seed.sql` | Demo opening hours + the service catalogue |

With the CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## 3. Create the first staff account

1. *Authentication → Users → Add user*: set an email and a strong password.
2. Copy the user's UUID and run:

```sql
insert into public.staff_profiles (user_id, full_name, role, active)
values ('<user-uuid>', 'Dr. Bouamara', 'admin', true);
```

3. Sign in at `/admin/login`.

> An account can authenticate but will still be refused `/admin` until it has an
> **active** row in `staff_profiles`. Revoke access by setting `active = false`
> — it takes effect immediately, without waiting for a token to expire.

## 4. Storage (optional, for clinic photography)

```sql
-- Public bucket for site media; uploads happen from the admin dashboard.
insert into storage.buckets (id, name, public) values ('clinic-media', 'clinic-media', true);
```

Add upload policies for staff only, then paste the public URLs into
*Admin → Gallery / Services*.

## Security model (summary)

- **Patients (anon key)**: may `INSERT` an appointment (`status = 'pending'`
  only) and a contact message. They can **never** read appointments or messages.
- **Availability**: anonymous callers read only `appointment_slots` /
  `time_off_slots` — views that expose time ranges and no patient data.
- **Staff**: full read/write on appointments, messages, services and hours,
  gated by `public.is_staff()`.
- **Admins**: additionally manage the `staff_profiles` allow-list.
- **Double-booking**: prevented in the database by an exclusion constraint
  (`appointments_no_overlap`), so it holds even under concurrent requests.
- **Audit**: status changes are recorded in `appointment_events`.

## Regenerating types

After changing the schema:

```bash
npx supabase gen types typescript --project-id <project-ref> --schema public > src/lib/supabase/types.ts
```
