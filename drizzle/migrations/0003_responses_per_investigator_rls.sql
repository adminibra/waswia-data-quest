CREATE OR REPLACE FUNCTION public.my_investigator_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT id FROM public.investigators WHERE user_id = auth.uid() LIMIT 1 $$;
DROP POLICY IF EXISTS "Authenticated users manage responses" ON public.responses;
CREATE POLICY "Admins manage all responses" ON public.responses FOR ALL TO authenticated USING (public.my_investigator_id() IS NULL) WITH CHECK (public.my_investigator_id() IS NULL);
CREATE POLICY "Investigators read own responses" ON public.responses FOR SELECT TO authenticated USING (investigator_id = public.my_investigator_id());
CREATE POLICY "Investigators insert own responses" ON public.responses FOR INSERT TO authenticated WITH CHECK (investigator_id = public.my_investigator_id());