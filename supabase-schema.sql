-- Calisthenics App V4 Supabase setup
-- Run this in Supabase > SQL Editor

create table if not exists public.workout_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.workout_states enable row level security;

drop policy if exists "Users can read their own workout state" on public.workout_states;
create policy "Users can read their own workout state"
on public.workout_states
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own workout state" on public.workout_states;
create policy "Users can insert their own workout state"
on public.workout_states
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workout state" on public.workout_states;
create policy "Users can update their own workout state"
on public.workout_states
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
