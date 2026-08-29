-- Form-41 / NESCO online application schema
create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique,
  application_type text not null,
  applicant_name text not null,
  father_or_husband text,
  nid text not null,
  mobile text not null,
  email text not null,
  division text not null default 'Rajshahi',
  district text not null,
  upazila text not null,
  address text not null,
  tariff text not null,
  phase text not null,
  requested_load_kw numeric(10,2) not null default 1,
  existing_account_no text,
  status text not null default 'submitted',
  remarks text,
  created_at timestamptz not null default now()
);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete set null,
  channel text not null default 'email',
  recipient text not null,
  subject text,
  body text,
  sent_at timestamptz not null default now()
);

create index if not exists applications_tracking_idx on public.applications (tracking_id);
create index if not exists applications_mobile_idx on public.applications (mobile);

alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.notification_log enable row level security;

drop policy if exists "public insert applications" on public.applications;
create policy "public insert applications" on public.applications for insert to anon, authenticated with check (true);
drop policy if exists "public select own tracking" on public.applications;
create policy "public select own tracking" on public.applications for select to anon, authenticated using (true);
drop policy if exists "public update applications" on public.applications;
create policy "public update applications" on public.applications for update to anon, authenticated using (true) with check (true);
drop policy if exists "public insert history" on public.application_status_history;
create policy "public insert history" on public.application_status_history for insert to anon, authenticated with check (true);
drop policy if exists "public select history" on public.application_status_history;
create policy "public select history" on public.application_status_history for select to anon, authenticated using (true);
drop policy if exists "public insert notifications" on public.notification_log;
create policy "public insert notifications" on public.notification_log for insert to anon, authenticated with check (true);
