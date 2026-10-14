-- Privacy and administration for PerlaRifa. Apply only to its new database.
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.reservations ALTER COLUMN user_id SET DEFAULT auth.uid();
CREATE INDEX IF NOT EXISTS reservations_user_id_idx ON public.reservations(user_id);

CREATE TABLE public.raffle_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.raffle_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.raffle_admins FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_raffle_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.raffle_admins WHERE user_id = auth.uid())
    AND COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) = false;
$$;
REVOKE ALL ON FUNCTION public.is_raffle_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_raffle_admin() TO authenticated;

DROP POLICY IF EXISTS "Public can read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can delete reservations" ON public.reservations;
REVOKE ALL ON public.reservations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;

CREATE POLICY "Owners and admins read reservations" ON public.reservations
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_raffle_admin()));
CREATE POLICY "Owners create pending reservations" ON public.reservations
FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()) AND status = 'pending' AND receipt IS NULL AND note IS NULL);
CREATE POLICY "Owners upload receipts and admins manage" ON public.reservations
FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_raffle_admin()))
WITH CHECK (user_id = (SELECT auth.uid()) OR (SELECT public.is_raffle_admin()));
CREATE POLICY "Only admins delete reservations" ON public.reservations
FOR DELETE TO authenticated USING ((SELECT public.is_raffle_admin()));

CREATE OR REPLACE FUNCTION public.protect_reservation_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NEW.status NOT IN ('pending', 'paid', 'frozen') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  IF NEW.phone !~ '^[0-9]{10,15}$' OR length(COALESCE(NEW.name, '')) > 100 THEN
    RAISE EXCEPTION 'Invalid participant information';
  END IF;
  IF NEW.receipt IS NOT NULL AND octet_length(NEW.receipt::text) > 12000000 THEN
    RAISE EXCEPTION 'Receipt too large';
  END IF;
  IF NOT public.is_raffle_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.user_id := auth.uid(); NEW.status := 'pending'; NEW.receipt := NULL;
      NEW.receipt_meta := NULL; NEW.note := NULL; NEW.created_at := now();
    ELSE
      IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id
        OR NEW.phone IS DISTINCT FROM OLD.phone OR NEW.name IS DISTINCT FROM OLD.name
        OR NEW.tickets IS DISTINCT FROM OLD.tickets OR NEW.status IS DISTINCT FROM OLD.status
        OR NEW.note IS DISTINCT FROM OLD.note OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Only the administrator can change reservation details';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_reservation_fields BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.protect_reservation_fields();
REVOKE ALL ON FUNCTION public.protect_reservation_fields() FROM PUBLIC, anon, authenticated;

-- This collision check must see all owners' rows, even though RLS hides them.
CREATE OR REPLACE FUNCTION public.prevent_duplicate_active_reservation_tickets()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE overlapping_ticket integer;
BEGIN
  IF NOT (NEW.status IN ('paid', 'frozen') OR NEW.receipt IS NOT NULL
    OR (NEW.status = 'pending' AND NEW.created_at > now() - interval '12 hours')) THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(20260703, locked.ticket)
    FROM (SELECT DISTINCT value AS ticket FROM unnest(NEW.tickets) AS value ORDER BY value) AS locked;
  SELECT ticket INTO overlapping_ticket FROM unnest(NEW.tickets) AS ticket
  WHERE EXISTS (
    SELECT 1 FROM public.reservations AS existing
    WHERE existing.id <> NEW.id AND ticket = ANY(existing.tickets)
      AND (existing.status IN ('paid', 'frozen') OR existing.receipt IS NOT NULL
        OR (existing.status = 'pending' AND existing.created_at > now() - interval '12 hours'))
  ) LIMIT 1;
  IF overlapping_ticket IS NOT NULL THEN
    RAISE EXCEPTION 'El boleto % ya está apartado.', lpad(overlapping_ticket::text, 3, '0') USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prevent_duplicate_active_reservation_tickets() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS prevent_duplicate_active_reservation_tickets ON public.reservations;
CREATE TRIGGER prevent_duplicate_active_reservation_tickets BEFORE INSERT OR UPDATE
ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_active_reservation_tickets();

-- Public availability exposes only occupied ticket numbers, never participant data.
CREATE OR REPLACE FUNCTION public.get_taken_tickets()
RETURNS TABLE(ticket integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT unnest(tickets) FROM public.reservations
  WHERE status IN ('paid', 'frozen') OR receipt IS NOT NULL
    OR (status = 'pending' AND created_at > now() - interval '12 hours');
$$;
REVOKE ALL ON FUNCTION public.get_taken_tickets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_taken_tickets() TO anon, authenticated;
ALTER TABLE public.reservations REPLICA IDENTITY DEFAULT;
