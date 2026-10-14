
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT NOT NULL,
  tickets INTEGER[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  receipt JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reservations_phone_idx ON public.reservations(phone);
CREATE INDEX reservations_created_at_idx ON public.reservations(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read reservations"
  ON public.reservations FOR SELECT
  USING (true);

CREATE POLICY "Public can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update reservations"
  ON public.reservations FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can delete reservations"
  ON public.reservations FOR DELETE
  USING (true);

ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
