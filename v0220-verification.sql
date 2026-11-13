-- Run as the project analyst/admin. Results contain no original images or credentials.
-- 1: Consumption residues across all final active-deck instance IDs.
select e.run_id,e.payload->>'card_id' card_id,e.payload->>'instance_id' instance_id
from public.v0220_card_events e join public.v0220_run_details r using(run_id)
where e.event_type='card_consumed' and exists(select 1 from jsonb_array_elements(r.terminal->'deck') c where c->>'instance_id'=e.payload->>'instance_id');
-- 2: A consumed instance is subsequently drawn/used or used as promotion material.
select e.run_id,e.seq,f.seq violation_seq,f.event_type
from public.v0220_card_events e join public.v0220_card_events f on f.run_id=e.run_id and f.seq>e.seq
where e.event_type='card_consumed' and ((f.event_type='card_used' and f.payload->>'instance_id'=e.payload->>'instance_id') or (f.event_type='cards_drawn' and exists(select 1 from jsonb_array_elements(f.payload->'cards') c where c->>'instance_id'=e.payload->>'instance_id')) or (f.event_type='card_promoted' and exists(select 1 from jsonb_array_elements(f.payload->'materials') m where m->>'instance_id'=e.payload->>'instance_id')));
-- 3: Missing event sequence IDs.
select run_id,count(*) n,min(seq),max(seq) from public.v0220_card_events group by run_id having min(seq)<>1 or count(*)<>max(seq);
-- 4: Terminal component total and retained manual score agreement.
select r.run_id,(r.terminal->>'score')::bigint score,sum((x->>'points')::bigint) component_total,m.score manual_score
from public.v0220_run_details r join public.manual_runs m on m.id=r.run_id cross join lateral jsonb_array_elements(r.terminal->'score_breakdown') x
group by r.run_id,r.terminal,m.score having (r.terminal->>'score')::bigint<>sum((x->>'points')::bigint) or m.score<>(r.terminal->>'score')::bigint;
-- 5: Purchase/use counts. QA/bot data are excluded from user analysis.
select e.payload->>'card_id' card_id,count(*) filter(where event_type='card_purchased') purchases,count(*) filter(where event_type='card_used') uses
from public.v0220_card_events e join public.v0220_run_details r using(run_id) where r.source='manual' and e.mode='official' and e.event_type in ('card_purchased','card_used') group by 1;
-- 6: Final deck card presence and clear rate (association, not causation).
select d.card_id,count(*) runs,avg((r.terminal->>'outcome'='clear')::int) clear_rate
from public.v0220_run_details r cross join lateral (select distinct c->>'card_id' card_id from jsonb_array_elements(r.terminal->'deck') c) d
where r.source='manual' and r.terminal is not null group by 1;
-- 7: Acquisition-round survival and clear rate.
with acquired as (select distinct run_id,round,payload->>'card_id' card_id from public.v0220_card_events where event_type='card_acquired' and mode='official')
select e.card_id,e.round acquisition_round,count(*) runs,
avg(((r.terminal->>'round')::int>=least(30,e.round+5))::int) survival_5_rounds,
avg((r.terminal->>'outcome'='clear')::int) clear_rate
from acquired e join public.v0220_run_details r using(run_id)
where r.source='manual' and r.terminal is not null group by 1,2;
-- 8: Initial random shop and clear rate.
select s->>'card_id' initial_card,count(*) runs,avg((r.terminal->>'outcome'='clear')::int) clear_rate
from public.v0220_run_details r cross join lateral jsonb_array_elements(r.initial_shop) s where r.source='manual' and r.terminal is not null group by 1;
-- 9: Unique unordered card pairs in final active deck and clear rate.
with d as(select r.run_id,r.terminal,array_agg(distinct c->>'card_id' order by c->>'card_id') ids from public.v0220_run_details r cross join lateral jsonb_array_elements(r.terminal->'deck') c where r.source='manual' and r.terminal is not null group by 1,2)
select a,b,count(*) runs,avg((terminal->>'outcome'='clear')::int) clear_rate from d cross join lateral unnest(ids) a cross join lateral unnest(ids) b where a<b group by a,b;
-- 10: Promotion tree/tier associations.
with promoted as (select distinct run_id,payload->>'recipe_id' recipe,payload->>'tier' tier from public.v0220_card_events where event_type='card_promoted' and mode='official')
select e.recipe,e.tier,count(*) runs,avg((r.terminal->>'outcome'='clear')::int) clear_rate
from promoted e join public.v0220_run_details r using(run_id) where r.source='manual' and r.terminal is not null group by 1,2;
-- 11: Per-card allocated actual damage, distinguished from causal damage.
select e.payload->>'card_id' card_id,e.payload->>'kind' attribution_kind,sum((e.payload->>'damage')::bigint) damage
from public.v0220_card_events e join public.v0220_run_details r using(run_id) where e.event_type='damage_contribution' and e.mode='official' and r.source='manual' group by 1,2;
-- 12: Avatar approval status and storage privacy; no public read grant should exist.
select id,public,file_size_limit from storage.buckets where id='luck-private-avatars-0220';
select approval_status,public_consent,count(*) from public.v0220_custom_images group by 1,2;
