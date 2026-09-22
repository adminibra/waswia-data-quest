ALTER TABLE public.investigators ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS investigators_user_id_key ON public.investigators (user_id) WHERE user_id IS NOT NULL;