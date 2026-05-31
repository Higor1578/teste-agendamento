
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin','business_owner','staff','customer');
CREATE TYPE public.business_category AS ENUM ('barbearia','lava_jato','manicure','salao_beleza');
CREATE TYPE public.business_status AS ENUM ('active','paused','suspended');
CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','completed','cancelled','no_show');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  business_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, business_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_business_owner(_user_id UUID, _business_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND business_id = _business_id AND role IN ('business_owner','staff')
  );
$$;

-- BUSINESSES
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category business_category NOT NULL,
  status business_status NOT NULL DEFAULT 'active',
  description TEXT,
  address TEXT,
  phone TEXT,
  cover_url TEXT,
  logo_url TEXT,
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '19:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.businesses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "businesses_public_read_active" ON public.businesses FOR SELECT TO anon, authenticated USING (status = 'active' OR auth.uid() = owner_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "businesses_owner_insert" ON public.businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "businesses_owner_update" ON public.businesses FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "businesses_owner_delete" ON public.businesses FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'super_admin'));

-- SERVICES
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price_cents INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services_owner_write" ON public.services FOR ALL TO authenticated
  USING (public.is_business_owner(auth.uid(), business_id) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.is_business_owner(auth.uid(), business_id) OR public.has_role(auth.uid(),'super_admin'));

-- PROFESSIONALS
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.professionals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "professionals_public_read" ON public.professionals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "professionals_owner_write" ON public.professionals FOR ALL TO authenticated
  USING (public.is_business_owner(auth.uid(), business_id) OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.is_business_owner(auth.uid(), business_id) OR public.has_role(auth.uid(),'super_admin'));

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX appointments_business_date ON public.appointments(business_id, scheduled_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT INSERT ON public.appointments TO anon;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_customer_read_own" ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.is_business_owner(auth.uid(), business_id) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "appointments_insert_public" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "appointments_owner_update" ON public.appointments FOR UPDATE TO authenticated
  USING (public.is_business_owner(auth.uid(), business_id) OR auth.uid() = customer_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "appointments_owner_delete" ON public.appointments FOR DELETE TO authenticated
  USING (public.is_business_owner(auth.uid(), business_id) OR public.has_role(auth.uid(),'super_admin'));

-- handle_new_user trigger: cria profile + role 'customer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
