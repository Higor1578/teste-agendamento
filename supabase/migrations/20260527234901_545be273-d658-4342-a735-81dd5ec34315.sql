
DROP POLICY "appointments_insert_public" ON public.appointments;
CREATE POLICY "appointments_insert_public" ON public.appointments
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(customer_name)) BETWEEN 2 AND 120
  AND length(trim(customer_phone)) BETWEEN 8 AND 30
  AND scheduled_at > now()
  AND (customer_id IS NULL OR customer_id = auth.uid())
);
