CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  amount_cents INT NOT NULL CHECK (amount_cents >= 0),
  spent_on DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX expenses_business_spent_on ON public.expenses(business_id, spent_on DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_owner_read" ON public.expenses
FOR SELECT TO authenticated
USING (
  public.is_business_owner(auth.uid(), business_id)
  OR public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "expenses_owner_insert" ON public.expenses
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND (
    public.is_business_owner(auth.uid(), business_id)
    OR public.has_role(auth.uid(), 'super_admin')
  )
);

CREATE POLICY "expenses_owner_update" ON public.expenses
FOR UPDATE TO authenticated
USING (
  public.is_business_owner(auth.uid(), business_id)
  OR public.has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  auth.uid() = owner_id
  AND (
    public.is_business_owner(auth.uid(), business_id)
    OR public.has_role(auth.uid(), 'super_admin')
  )
);

CREATE POLICY "expenses_owner_delete" ON public.expenses
FOR DELETE TO authenticated
USING (
  public.is_business_owner(auth.uid(), business_id)
  OR public.has_role(auth.uid(), 'super_admin')
);
