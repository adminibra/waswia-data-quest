CREATE TABLE public.surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT 'Pas de description',
  questions integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surveys TO authenticated;
GRANT ALL ON public.surveys TO service_role;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage surveys" ON public.surveys FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.investigators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investigators TO authenticated;
GRANT ALL ON public.investigators TO service_role;
ALTER TABLE public.investigators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage investigators" ON public.investigators FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigator_id uuid NOT NULL REFERENCES public.investigators(id) ON DELETE CASCADE,
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (investigator_id, survey_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage assignments" ON public.assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES public.surveys(id) ON DELETE SET NULL,
  survey_title text NOT NULL DEFAULT '',
  investigator_id uuid REFERENCES public.investigators(id) ON DELETE SET NULL,
  investigator_name text NOT NULL DEFAULT '',
  collected_at timestamptz NOT NULL DEFAULT now(),
  gps text NOT NULL DEFAULT '-',
  status text NOT NULL DEFAULT 'Terminé'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.responses TO authenticated;
GRANT ALL ON public.responses TO service_role;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage responses" ON public.responses FOR ALL TO authenticated USING (true) WITH CHECK (true);