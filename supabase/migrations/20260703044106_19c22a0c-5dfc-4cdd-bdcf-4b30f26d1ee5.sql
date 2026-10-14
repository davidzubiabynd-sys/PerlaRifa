CREATE INDEX IF NOT EXISTS reservations_created_at_desc_idx ON public.reservations (created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_status_created_at_idx ON public.reservations (status, created_at DESC);
CREATE INDEX IF NOT EXISTS reservations_tickets_gin_idx ON public.reservations USING gin (tickets);