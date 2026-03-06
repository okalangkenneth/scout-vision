-- =============================================================
-- ScoutVision – Supabase Schema
-- =============================================================

-- ---------------------------------------------------------------
-- 1. profiles
--    Extends auth.users with display metadata.
--    Created automatically via trigger on auth.users insert.
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read and update only their own profile
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------------------------
-- 2. athletes
--    One row per athlete tracked by a scout.
-- ---------------------------------------------------------------
create table if not exists public.athletes (
  id          uuid primary key default gen_random_uuid(),
  scout_id    uuid not null references public.profiles (id) on delete cascade,
  name        text not null,
  sport       text not null,
  position    text,
  age         int,
  team        text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.athletes enable row level security;

create index if not exists athletes_scout_id_idx on public.athletes (scout_id);

-- RLS: scouts can only access their own athletes
create policy "athletes: select own" on public.athletes
  for select using (auth.uid() = scout_id);

create policy "athletes: insert own" on public.athletes
  for insert with check (auth.uid() = scout_id);

create policy "athletes: update own" on public.athletes
  for update using (auth.uid() = scout_id);

create policy "athletes: delete own" on public.athletes
  for delete using (auth.uid() = scout_id);


-- ---------------------------------------------------------------
-- 3. videos
--    Video clips uploaded to Supabase Storage, linked to an athlete.
-- ---------------------------------------------------------------
create table if not exists public.videos (
  id               uuid primary key default gen_random_uuid(),
  athlete_id       uuid not null references public.athletes (id) on delete cascade,
  storage_path     text not null,
  filename         text not null,
  duration_seconds int,
  uploaded_at      timestamptz not null default now()
);

alter table public.videos enable row level security;

create index if not exists videos_athlete_id_idx on public.videos (athlete_id);

-- RLS: scouts can only access videos for their own athletes
create policy "videos: select own" on public.videos
  for select using (
    exists (
      select 1 from public.athletes a
      where a.id = videos.athlete_id
        and a.scout_id = auth.uid()
    )
  );

create policy "videos: insert own" on public.videos
  for insert with check (
    exists (
      select 1 from public.athletes a
      where a.id = videos.athlete_id
        and a.scout_id = auth.uid()
    )
  );

create policy "videos: update own" on public.videos
  for update using (
    exists (
      select 1 from public.athletes a
      where a.id = videos.athlete_id
        and a.scout_id = auth.uid()
    )
  );

create policy "videos: delete own" on public.videos
  for delete using (
    exists (
      select 1 from public.athletes a
      where a.id = videos.athlete_id
        and a.scout_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------
-- 4. analysis_reports
--    AI-generated scouting reports stored as JSONB.
-- ---------------------------------------------------------------
create table if not exists public.analysis_reports (
  id          uuid primary key default gen_random_uuid(),
  video_id    uuid not null references public.videos (id) on delete cascade,
  athlete_id  uuid not null references public.athletes (id) on delete cascade,
  scout_id    uuid not null references public.profiles (id) on delete cascade,
  report      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.analysis_reports enable row level security;

create index if not exists analysis_reports_scout_id_idx   on public.analysis_reports (scout_id);
create index if not exists analysis_reports_athlete_id_idx on public.analysis_reports (athlete_id);
create index if not exists analysis_reports_video_id_idx   on public.analysis_reports (video_id);

-- RLS: scouts can only access their own reports
create policy "analysis_reports: select own" on public.analysis_reports
  for select using (auth.uid() = scout_id);

create policy "analysis_reports: insert own" on public.analysis_reports
  for insert with check (auth.uid() = scout_id);

create policy "analysis_reports: update own" on public.analysis_reports
  for update using (auth.uid() = scout_id);

create policy "analysis_reports: delete own" on public.analysis_reports
  for delete using (auth.uid() = scout_id);


-- ---------------------------------------------------------------
-- 5. subscriptions
--    Stripe subscription state per user.
-- ---------------------------------------------------------------
create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id text,
  plan               text not null check (plan in ('starter', 'pro', 'unlimited')),
  status             text not null default 'inactive',
  created_at         timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- RLS: users can only read their own subscription
create policy "subscriptions: select own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Inserts/updates managed server-side via Stripe webhook (service role key only)
-- No client-side insert/update policies intentionally omitted for security
