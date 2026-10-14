CREATE OR REPLACE FUNCTION public.prevent_duplicate_active_reservation_tickets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  overlapping_ticket integer;
BEGIN
  PERFORM pg_advisory_xact_lock(20260703, locked.ticket)
  FROM (
    SELECT DISTINCT value AS ticket
    FROM unnest(NEW.tickets) AS value
    ORDER BY value
  ) AS locked;

  SELECT ticket
  INTO overlapping_ticket
  FROM unnest(NEW.tickets) AS ticket
  WHERE EXISTS (
    SELECT 1
    FROM public.reservations AS existing
    WHERE existing.id <> NEW.id
      AND ticket = ANY(existing.tickets)
      AND (
        existing.status IN ('paid', 'frozen')
        OR existing.receipt IS NOT NULL
        OR (existing.status = 'pending' AND existing.created_at > now() - interval '12 hours')
      )
  )
  LIMIT 1;

  IF overlapping_ticket IS NOT NULL THEN
    RAISE EXCEPTION 'El boleto % ya está apartado.', lpad(overlapping_ticket::text, 3, '0')
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_duplicate_active_reservation_tickets() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prevent_duplicate_active_reservation_tickets() FROM anon;
REVOKE ALL ON FUNCTION public.prevent_duplicate_active_reservation_tickets() FROM authenticated;