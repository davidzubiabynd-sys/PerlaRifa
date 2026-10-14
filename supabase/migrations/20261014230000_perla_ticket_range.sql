-- Restricción de numeración de PerlaRifa: 001 a 200, sin duplicados.
CREATE OR REPLACE FUNCTION public.validate_perla_ticket_range()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF cardinality(NEW.tickets) = 0 OR EXISTS (
    SELECT 1 FROM unnest(NEW.tickets) AS ticket WHERE ticket IS NULL OR ticket < 1 OR ticket > 200
  ) OR cardinality(NEW.tickets) <> (SELECT count(DISTINCT ticket) FROM unnest(NEW.tickets) AS ticket) THEN
    RAISE EXCEPTION 'Los boletos deben ser únicos y estar entre 001 y 200.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_perla_ticket_range BEFORE INSERT OR UPDATE OF tickets
ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.validate_perla_ticket_range();
