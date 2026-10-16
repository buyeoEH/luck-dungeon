-- LUCK Dungeon AutoLab v0.2. Safe additive objects only; existing bot_runs is not modified.
-- Execute once in the correct Supabase project SQL Editor.
CREATE TABLE IF NOT EXISTS public.autolab_batches (
  batch_id uuid PRIMARY KEY,
  github_run_id text,
  github_run_attempt text,
  git_sha text,
  status text NOT NULL DEFAULT 'uploading',
  runs_ingested integer NOT NULL DEFAULT 0,
  rounds_ingested integer NOT NULL DEFAULT 0,
  events_ingested integer NOT NULL DEFAULT 0,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.autolab_rounds (
  batch_id uuid NOT NULL REFERENCES public.autolab_batches(batch_id) ON DELETE CASCADE,
  strategy text NOT NULL,
  seed bigint NOT NULL,
  round integer NOT NULL,
  score integer,
  enemy_hp integer,
  enemy_count integer,
  attack integer,
  damage integer,
  aoe_damage integer,
  deck integer,
  PRIMARY KEY(batch_id,strategy,seed,round)
);
CREATE TABLE IF NOT EXISTS public.autolab_events (
  batch_id uuid NOT NULL REFERENCES public.autolab_batches(batch_id) ON DELETE CASCADE,
  strategy text NOT NULL,
  seed bigint NOT NULL,
  event_index integer NOT NULL,
  round integer,
  phase text,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY(batch_id,strategy,seed,event_index)
);
CREATE INDEX IF NOT EXISTS autolab_events_type_idx ON public.autolab_events(event_type);
CREATE INDEX IF NOT EXISTS autolab_rounds_strategy_idx ON public.autolab_rounds(strategy,round);
-- Logs are diagnostic and private. service_role bypasses RLS (only in GitHub Actions secrets).
ALTER TABLE public.autolab_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autolab_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autolab_events ENABLE ROW LEVEL SECURITY;
-- Deliberately no anon/authenticated grants or policies on the diagnostic tables.
-- Confirm existing bot_runs table/columns and GitHub secrets separately.

-- Explicit API access for modern Supabase defaults (Oct 2026).
-- Do not grant public read access to diagnostic data.
REVOKE ALL ON TABLE public.autolab_batches, public.autolab_rounds, public.autolab_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.autolab_batches, public.autolab_rounds, public.autolab_events TO service_role;

-- Data API grants are independent of RLS; only the server uploader needs access.
REVOKE ALL ON public.autolab_batches, public.autolab_rounds, public.autolab_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.autolab_batches, public.autolab_rounds, public.autolab_events TO service_role;
