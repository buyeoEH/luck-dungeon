-- Remove Supabase's default table grants before granting only the required operations.
revoke all on public.v0220_run_details,public.v0220_card_events,public.v0220_custom_images from authenticated;
grant select,insert,update on public.v0220_run_details to authenticated;
grant select,insert on public.v0220_card_events,public.v0220_custom_images to authenticated;
alter table public.v0220_card_events add constraint v0220_instance_required check(event_type not in ('card_used','card_consumed','card_acquired','card_purchased','card_removed') or (jsonb_typeof(payload->'card_id')='string' and jsonb_typeof(payload->'instance_id')='string'));
alter table public.v0220_card_events add constraint v0220_consumption_absent check(event_type<>'card_consumed' or (payload->'remaining'='{"deck":false,"hand":false,"draw":false,"graveyard":false}'::jsonb and payload->>'promotion_candidate'='false' and (payload->>'deck_size_before')::integer-(payload->>'deck_size_after')::integer=1));
