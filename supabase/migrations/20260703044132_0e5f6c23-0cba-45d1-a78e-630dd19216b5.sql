ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS receipt_meta jsonb;

UPDATE public.reservations
SET receipt_meta = CASE
  WHEN receipt IS NULL THEN NULL
  ELSE jsonb_strip_nulls(jsonb_build_object(
    'name', receipt->>'name',
    'type', receipt->>'type',
    'uploadedAt', receipt->'uploadedAt'
  ))
END
WHERE receipt IS NOT NULL
  AND receipt_meta IS NULL;

CREATE OR REPLACE FUNCTION public.sync_reservation_receipt_meta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.receipt_meta = CASE
    WHEN NEW.receipt IS NULL THEN NULL
    ELSE jsonb_strip_nulls(jsonb_build_object(
      'name', NEW.receipt->>'name',
      'type', NEW.receipt->>'type',
      'uploadedAt', NEW.receipt->'uploadedAt'
    ))
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_reservation_receipt_meta ON public.reservations;
CREATE TRIGGER sync_reservation_receipt_meta
BEFORE INSERT OR UPDATE OF receipt ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.sync_reservation_receipt_meta();

REVOKE ALL ON FUNCTION public.sync_reservation_receipt_meta() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_reservation_receipt_meta() FROM anon;
REVOKE ALL ON FUNCTION public.sync_reservation_receipt_meta() FROM authenticated;