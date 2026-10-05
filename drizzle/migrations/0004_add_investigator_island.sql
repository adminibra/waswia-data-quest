ALTER TABLE public.investigators ADD COLUMN island text NOT NULL DEFAULT '';
COMMENT ON COLUMN public.investigators.island IS 'Île de l''enquêteur (zone d''affectation)';