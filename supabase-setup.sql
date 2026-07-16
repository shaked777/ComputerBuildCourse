-- ═══════════════════════════════════════════════════════════════
-- Assembly Quest · Supabase setup (safe to re-run; contains no secrets)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── 1 · Leaderboard ─────────────────────────────────────────────
create table if not exists public.leaderboard (
  player_id  text primary key,
  name       text not null check (char_length(name) between 1 and 24),
  xp         integer not null default 0 check (xp >= 0 and xp <= 1000000),
  updated_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

drop policy if exists "public read"   on public.leaderboard;
drop policy if exists "public insert" on public.leaderboard;
drop policy if exists "public update" on public.leaderboard;
create policy "public read"   on public.leaderboard for select using (true);
create policy "public insert" on public.leaderboard for insert with check (true);
create policy "public update" on public.leaderboard for update using (true) with check (true);
-- Note: no DELETE policy → nobody can wipe the board with the public key.

-- Remove the demo "AI" bots — the board now shows real players only (top 5).
delete from public.leaderboard where player_id like 'seed-%';

-- ── 2 · Friend challenges (survival duels) ──────────────────────
create table if not exists public.challenges (
  id               text primary key check (char_length(id) between 4 and 16),
  challenger_name  text not null check (char_length(challenger_name) between 1 and 24),
  challenger_score integer not null check (challenger_score >= 0 and challenger_score <= 10000),
  opponent_name    text check (opponent_name is null or char_length(opponent_name) between 1 and 24),
  opponent_score   integer check (opponent_score is null or (opponent_score >= 0 and opponent_score <= 10000)),
  created_at       timestamptz not null default now()
);

alter table public.challenges enable row level security;

drop policy if exists "public read"   on public.challenges;
drop policy if exists "public insert" on public.challenges;
drop policy if exists "public update" on public.challenges;
create policy "public read"   on public.challenges for select using (true);
create policy "public insert" on public.challenges for insert with check (true);
-- Opponent may fill in their result exactly once (row not yet answered):
create policy "public update" on public.challenges
  for update using (opponent_score is null) with check (true);

-- ── 3 · Cloud progress backup (progress survives cleared browser storage) ──
create table if not exists public.profiles (
  player_id  text primary key,
  name       text not null check (char_length(name) between 1 and 24),
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "public read"   on public.profiles;
drop policy if exists "public insert" on public.profiles;
drop policy if exists "public update" on public.profiles;
create policy "public read"   on public.profiles for select using (true);
create policy "public insert" on public.profiles for insert with check (true);
create policy "public update" on public.profiles for update using (true) with check (true);
