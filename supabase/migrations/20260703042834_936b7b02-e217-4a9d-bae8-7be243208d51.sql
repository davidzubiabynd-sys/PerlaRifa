CREATE OR REPLACE FUNCTION public.prevent_duplicate_active_reservation_tickets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  overlapping_ticket integer;
BEGIN
  SELECT ticket
  INTO overlapping_ticket
  FROM unnest(NEW.tickets) AS ticket
  WHERE EXISTS (
    SELECT 1
    FROM public.reservations AS existing
    WHERE existing.id <> NEW.id
      AND existing.status NOT IN ('cancelled', 'released')
      AND ticket = ANY(existing.tickets)
  )
  LIMIT 1;

  IF overlapping_ticket IS NOT NULL THEN
    RAISE EXCEPTION 'El boleto % ya está apartado.', lpad(overlapping_ticket::text, 3, '0')
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_active_reservation_tickets ON public.reservations;
CREATE TRIGGER prevent_duplicate_active_reservation_tickets
BEFORE INSERT OR UPDATE OF tickets ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_active_reservation_tickets();