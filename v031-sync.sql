create table public.v031_run_details (like public.v0220_run_details including all);
create table public.v031_card_events (like public.v0220_card_events including all);
do $$ declare r record; begin
 for r in select conrelid::regclass as tbl, conname from pg_constraint where conrelid in ('public.v031_run_details'::regclass,'public.v031_card_events'::regclass) and contype='c' and pg_get_constraintdef(oid) like '%version =%' loop
 execute format('alter table %s drop constraint %I',r.tbl,r.conname);
 end loop;
end $$;
alter table public.v031_run_details add constraint v031_version check (version like '0.3.%');
alter table public.v031_card_events add constraint v031_event_version check (version like '0.3.%');
alter table public.v031_card_events add constraint v031_event_run foreign key (run_id) references public.v031_run_details(run_id);
alter table public.v031_run_details enable row level security;
alter table public.v031_card_events enable row level security;
revoke all on public.v031_run_details,public.v031_card_events from anon,authenticated;
grant select,insert,update on public.v031_run_details to authenticated;
grant select,insert on public.v031_card_events to authenticated;
create policy v031_runs_read on public.v031_run_details for select to authenticated using (user_id=(select auth.uid()));
create policy v031_runs_insert on public.v031_run_details for insert to authenticated with check (user_id=(select auth.uid()));
create policy v031_runs_update on public.v031_run_details for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy v031_events_read on public.v031_card_events for select to authenticated using (user_id=(select auth.uid()));
create policy v031_events_insert on public.v031_card_events for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.v031_run_details r where r.run_id=v031_card_events.run_id and r.user_id=(select auth.uid()) and r.version=v031_card_events.version and r.build_id=v031_card_events.build_id));
