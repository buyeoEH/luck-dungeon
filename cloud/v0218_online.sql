-- Additive migration: existing gameplay records and policies remain in place.
alter table public.manual_runs add column if not exists initials text;
alter table public.manual_runs add column if not exists endless_max_round integer not null default 0;
create index if not exists manual_runs_user_id_idx on public.manual_runs(user_id);
create policy manual_runs_update_own on public.manual_runs for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant update on public.manual_runs to authenticated;
create table public.leaderboard_entries (
 run_id text primary key references public.manual_runs(id),
 initials text not null check (initials ~ '^[가-힣A-Z0-9]{2,6}$'),
 version text not null, outcome text not null check(outcome in ('clear','gameover')),
 round integer not null check(round>0), score integer not null,
 play_ms bigint, endless_max_round integer not null default 0 check(endless_max_round>=0),
 created_at timestamptz not null
);
alter table public.leaderboard_entries enable row level security;
grant select on public.leaderboard_entries to anon,authenticated;
grant insert,update on public.leaderboard_entries to authenticated;
create policy leaderboard_public_read on public.leaderboard_entries for select to anon,authenticated using(true);
create policy leaderboard_insert_owned_run on public.leaderboard_entries for insert to authenticated with check(exists(select 1 from public.manual_runs m where m.id=run_id and m.user_id=(select auth.uid()) and m.initials=leaderboard_entries.initials and m.version=leaderboard_entries.version and m.outcome=leaderboard_entries.outcome and m.round=leaderboard_entries.round and m.score=leaderboard_entries.score and m.play_ms is not distinct from leaderboard_entries.play_ms and m.endless_max_round=leaderboard_entries.endless_max_round and m.created_at=leaderboard_entries.created_at));
create policy leaderboard_update_owned_run on public.leaderboard_entries for update to authenticated using(exists(select 1 from public.manual_runs m where m.id=run_id and m.user_id=(select auth.uid()))) with check(exists(select 1 from public.manual_runs m where m.id=run_id and m.user_id=(select auth.uid()) and m.initials=leaderboard_entries.initials and m.version=leaderboard_entries.version and m.outcome=leaderboard_entries.outcome and m.round=leaderboard_entries.round and m.score=leaderboard_entries.score and m.play_ms is not distinct from leaderboard_entries.play_ms and m.endless_max_round=leaderboard_entries.endless_max_round and m.created_at=leaderboard_entries.created_at));
create index leaderboard_version_score_idx on public.leaderboard_entries(version,score desc,created_at);
-- Only generated bot diagnostics are public; manual logs remain owner-only.
grant select on public.autolab_batches,public.autolab_rounds,public.autolab_events to anon,authenticated;
create policy autolab_batches_public_read on public.autolab_batches for select to anon,authenticated using(true);
create policy autolab_rounds_public_read on public.autolab_rounds for select to anon,authenticated using(true);
create policy autolab_events_public_read on public.autolab_events for select to anon,authenticated using(true);
