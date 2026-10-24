-- Cover composite owner foreign keys identified by the performance advisor.
create index v0220_event_parent_owner on public.v0220_card_events(run_id,user_id);
create index v0220_image_parent_owner on public.v0220_custom_images(run_id,user_id);
