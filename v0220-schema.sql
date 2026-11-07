-- Additive v0.2.20 private telemetry. No historical rows are rewritten.
create table public.v0220_run_details (
 run_id text primary key, user_id uuid not null references auth.users(id),
 version text not null check(version='0.2.20'), build_id text not null,
 source text not null default 'manual' check(source in ('manual','bot','qa')),
 started_at timestamptz not null, settings jsonb not null, character jsonb,
 initial_shop jsonb not null check(jsonb_typeof(initial_shop)='array'),
 terminal jsonb, official_snapshot jsonb, score_ruleset_version text not null,
 endless_max_round integer not null default 0 check(endless_max_round>=0),
 unique(run_id,user_id)
);
create index v0220_runs_owner on public.v0220_run_details(user_id,started_at desc);
create table public.v0220_card_events (
 run_id text not null, user_id uuid not null, seq integer not null check(seq>0),
 round integer not null check(round>=1), mode text not null check(mode in ('official','endless')),
 event_type text not null, payload jsonb not null,
 version text not null check(version='0.2.20'),build_id text not null,
 primary key(run_id,seq),foreign key(run_id,user_id) references public.v0220_run_details(run_id,user_id)
);
create index v0220_events_owner on public.v0220_card_events(user_id,run_id);
create index v0220_events_card_type on public.v0220_card_events(event_type,(payload->>'card_id'));
create unique index v0220_consume_once on public.v0220_card_events(run_id,(payload->>'instance_id')) where event_type='card_consumed';
create table public.v0220_custom_images (
 run_id text primary key, user_id uuid not null, sha256 text not null check(sha256 ~ '^[0-9a-f]{64}$'),
 original_path text not null, thumbnail_path text not null,
 approval_status text not null default 'pending' check(approval_status in ('pending','approved','rejected')),
 public_consent boolean not null default false,
 foreign key(run_id,user_id) references public.v0220_run_details(run_id,user_id),
 check(split_part(original_path,'/',1)=user_id::text and split_part(thumbnail_path,'/',1)=user_id::text)
);
create index v0220_images_owner on public.v0220_custom_images(user_id);
alter table public.v0220_run_details enable row level security;
alter table public.v0220_card_events enable row level security;
alter table public.v0220_custom_images enable row level security;
grant select,insert,update on public.v0220_run_details to authenticated;
grant select,insert on public.v0220_card_events,public.v0220_custom_images to authenticated;
revoke all on public.v0220_run_details,public.v0220_card_events,public.v0220_custom_images from anon;
create policy v0220_runs_read on public.v0220_run_details for select to authenticated using(user_id=(select auth.uid()));
create policy v0220_runs_insert on public.v0220_run_details for insert to authenticated with check(user_id=(select auth.uid()));
create policy v0220_runs_update on public.v0220_run_details for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy v0220_events_read on public.v0220_card_events for select to authenticated using(user_id=(select auth.uid()));
create policy v0220_events_insert on public.v0220_card_events for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.v0220_run_details r where r.run_id=v0220_card_events.run_id and r.user_id=(select auth.uid()) and r.version=v0220_card_events.version and r.build_id=v0220_card_events.build_id));
create policy v0220_images_read on public.v0220_custom_images for select to authenticated using(user_id=(select auth.uid()));
create policy v0220_images_insert on public.v0220_custom_images for insert to authenticated with check(user_id=(select auth.uid()) and approval_status='pending' and not public_consent);

create schema if not exists luck_internal;
revoke all on schema luck_internal from public,anon,authenticated;
create function luck_internal.freeze_v0220_details() returns trigger language plpgsql security invoker set search_path='' as $$
declare total bigint;
begin
 if tg_op='UPDATE' then
  if new.run_id<>old.run_id or new.user_id<>old.user_id or new.version<>old.version or new.build_id<>old.build_id or new.started_at<>old.started_at or new.settings<>old.settings or new.initial_shop<>old.initial_shop or new.source<>old.source then raise exception 'immutable run identity'; end if;
  if old.terminal is not null and (new.terminal is distinct from old.terminal or new.official_snapshot is distinct from old.official_snapshot) then raise exception 'official result is immutable'; end if;
  if new.endless_max_round<old.endless_max_round then raise exception 'endless round cannot decrease'; end if;
 end if;
 if new.terminal is not null then
  select coalesce(sum((x->>'points')::bigint),0) into total from jsonb_array_elements(new.terminal->'score_breakdown') x;
  if total<>(new.terminal->>'score')::bigint then raise exception 'score breakdown mismatch'; end if;
  if new.terminal->>'score_ruleset_version'<>new.score_ruleset_version then raise exception 'score ruleset mismatch'; end if;
  if new.official_snapshot is not null and ((new.official_snapshot->>'score')::bigint<>(new.terminal->>'score')::bigint or new.terminal->>'outcome'<>'clear') then raise exception 'official snapshot mismatch'; end if;
 end if;
 return new;
end $$;
create trigger freeze_v0220_details before insert or update on public.v0220_run_details for each row execute function luck_internal.freeze_v0220_details();
create function luck_internal.freeze_v0220_manual() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if old.version='0.2.20' and (to_jsonb(new)-'initials'-'endless_max_round') is distinct from (to_jsonb(old)-'initials'-'endless_max_round') then raise exception 'v0.2.20 official record is immutable'; end if;
 if old.version='0.2.20' and new.endless_max_round<old.endless_max_round then raise exception 'endless round cannot decrease'; end if;
 return new;
end $$;
create trigger freeze_v0220_manual before update on public.manual_runs for each row execute function luck_internal.freeze_v0220_manual();
revoke all on all functions in schema luck_internal from public,anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('luck-private-avatars-0220','luck-private-avatars-0220',false,1572864,array['image/png','image/jpeg','image/webp','image/gif']);
create policy v0220_avatar_read on storage.objects for select to authenticated using(bucket_id='luck-private-avatars-0220' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy v0220_avatar_insert on storage.objects for insert to authenticated with check(bucket_id='luck-private-avatars-0220' and (storage.foldername(name))[1]=(select auth.uid())::text and exists(select 1 from public.v0220_run_details r where r.run_id=(storage.foldername(name))[2] and r.user_id=(select auth.uid())));
-- No public image policy, no client approval/update permission, no leaderboard image URL.
