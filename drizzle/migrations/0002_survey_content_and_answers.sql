ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS content jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS answers jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS accuracy double precision;