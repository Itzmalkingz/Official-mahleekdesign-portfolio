-- =============================================================================
-- Mahleek Studio — Admin Control Center (Phase 1)
-- Idempotent, additive. Safe to run multiple times. Preserves all existing data.
-- Run in the Supabase SQL Editor.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0) Add missing columns to PROGRAMS (live DB lacked images/features jsonb,
--    which the public site and admin editors expect).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS "year" text;

-- Backfill images jsonb from the existing normalized table (if any rows exist)
UPDATE public.projects p
SET images = COALESCE(
  (SELECT jsonb_agg(jsonb_build_object(
      'id', pi.id, 'image_url', pi.image_url, 'alt_text', pi.alt_text,
      'sort_order', pi.sort_order
    ) ORDER BY pi.sort_order, pi.created_at)
   FROM public.project_images pi WHERE pi.project_id = p.id AND pi.image_url IS NOT NULL),
  '[]'::jsonb);

-- Backfill features jsonb from the existing normalized table
UPDATE public.projects p
SET features = COALESCE(
  (SELECT jsonb_agg(jsonb_build_object(
      'id', pf.id, 'name', pf.name, 'description', pf.description,
      'sort_order', pf.sort_order
    ) ORDER BY pf.sort_order, pf.created_at)
   FROM public.project_features pf WHERE pf.project_id = p.id AND pf.name IS NOT NULL),
  '[]'::jsonb);

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) ENQUIRIES — extend for the inbox / lead pipeline
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'
      CHECK (priority IN ('low','normal','high','urgent')),
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS lead_status text NOT NULL DEFAULT 'new'
      CHECK (lead_status IN ('new','contacted','qualified','discussion','proposal','won','lost'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) TESTIMONIALS — ordering column
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) PROFILES (admin roles; FK to auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','editor','staff')),
  avatar_url text,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create a profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security-definer role check (avoids RLS recursion on profiles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role IN ('admin','editor')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_editor() TO authenticated, anon;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile: read own" ON public.profiles;
CREATE POLICY "Profile: read own" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Profile: admin read all" ON public.profiles;
CREATE POLICY "Profile: admin read all" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Profile: update own basic fields" ON public.profiles;
CREATE POLICY "Profile: update own basic fields" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND role = 'staff');

DROP POLICY IF EXISTS "Profile: admin manage" ON public.profiles;
CREATE POLICY "Profile: admin manage" ON public.profiles
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed the first admin from an existing auth user (EDIT the email to match yours)
INSERT INTO public.profiles (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'mahleekdesign@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) SETTINGS (keyed jsonb)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.settings (key, value) VALUES
  ('general',  jsonb_build_object('site_name','Mahleek Design','site_url',COALESCE('sqlite://unused',''),'description','Memorable brands. Purposeful web systems.')) ON CONFLICT (key) DO NOTHING,
  ('contact',  jsonb_build_object('email','mahleekdesign@gmail.com','whatsapp','https://wa.me/2349116537383','location','','phone','')) ON CONFLICT (key) DO NOTHING,
  ('social',   jsonb_build_object('github','https://github.com','twitter','','instagram','','linkedin','')) ON CONFLICT (key) DO NOTHING,
  ('homepage', jsonb_build_object('hero_heading','','hero_description','','cta_primary','Start a Project','cta_secondary','View Work')) ON CONFLICT (key) DO NOTHING,
  ('booking',  jsonb_build_object('enabled',false,'confirmation_message','Thanks! Your session request has been received.')) ON CONFLICT (key) DO NOTHING
ON CONFLICT DO NOTHING;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings: read all authenticated" ON public.settings;
CREATE POLICY "Settings: read all authenticated" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Settings: admin write" ON public.settings;
CREATE POLICY "Settings: admin write" ON public.settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) CLIENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  email text,
  phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','lead','past')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_created ON public.clients (created_at DESC);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients: authenticated all" ON public.clients;
CREATE POLICY "Clients: authenticated all" ON public.clients
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_enquiries_client ON public.enquiries (client_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) APPOINTMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  project_type text,
  message text,
  appointment_date date,
  appointment_time time,
  duration_minutes integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending','confirmed','completed','cancelled','no-show','rejected')),
  notes text,
  source text NOT NULL DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Appointments: authenticated all" ON public.appointments;
CREATE POLICY "Appointments: authenticated all" ON public.appointments
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Appointments: public insert" ON public.appointments;
CREATE POLICY "Appointments: public insert" ON public.appointments
  FOR INSERT WITH CHECK (status = 'pending');

-- ─────────────────────────────────────────────────────────────────────────────
-- 7) AVAILABILITY (singleton row)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.availability (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  working_days integer[] NOT NULL DEFAULT '{1,2,3,4,5}',
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '17:00',
  slot_duration_minutes integer NOT NULL DEFAULT 30,
  buffer_minutes integer NOT NULL DEFAULT 15,
  max_bookings_per_day integer NOT NULL DEFAULT 5,
  blocked_dates date[] NOT NULL DEFAULT '{}',
  timezone text NOT NULL DEFAULT 'Africa/Lagos',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.availability (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Availability: read" ON public.availability;
CREATE POLICY "Availability: read" ON public.availability
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Availability: authenticated write" ON public.availability;
CREATE POLICY "Availability: authenticated write" ON public.availability
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- 8) MEDIA LIBRARY (tracks Supabase Storage objects)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  path text NOT NULL UNIQUE,
  bucket text NOT NULL DEFAULT 'design-uploads',
  url text,
  mime_type text,
  size_bytes bigint,
  alt_text text,
  width integer,
  height integer,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_created ON public.media (created_at DESC);
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Media: authenticated all" ON public.media;
CREATE POLICY "Media: authenticated all" ON public.media
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Media: public read" ON public.media;
CREATE POLICY "Media: public read" ON public.media
  FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9) ACTIVITY LOGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  entity_title text,
  meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs (created_at DESC);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Activity: read" ON public.activity_logs;
CREATE POLICY "Activity: read" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Activity: insert" ON public.activity_logs;
CREATE POLICY "Activity: insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- 10) NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'system'
      CHECK (type IN ('enquiry','appointment','system','lead','content')),
  title text NOT NULL,
  message text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (read, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications: read" ON public.notifications;
CREATE POLICY "Notifications: read" ON public.notifications
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Notifications: update read" ON public.notifications;
CREATE POLICY "Notifications: update read" ON public.notifications
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Notifications: insert" ON public.notifications;
CREATE POLICY "Notifications: insert" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Notification triggers (SECURITY DEFINER — fires even for public inserts)
CREATE OR REPLACE FUNCTION public.notify_new_enquiry()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link)
  VALUES ('enquiry', 'New enquiry from ' || NEW.name,
          NEW.project_type || ' · ' || LEFT(NEW.message, 120),
          '/admin/enquiries?enquiry=' || NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enquiries_notify ON public.enquiries;
CREATE TRIGGER enquiries_notify
  AFTER INSERT ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_enquiry();

CREATE OR REPLACE FUNCTION public.notify_appointment()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (type, title, message, link)
    VALUES ('appointment', 'New appointment request from ' || NEW.name,
            (NEW.appointment_date::text || ' at ' || NEW.appointment_time::text),
            '/admin/appointments');
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (type, title, message, link)
    VALUES ('appointment', 'Appointment ' || NEW.status || ': ' || NEW.name,
            (NEW.appointment_date::text || ' at ' || NEW.appointment_time::text),
            '/admin/appointments');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS appointments_notify ON public.appointments;
CREATE TRIGGER appointments_notify
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.notify_appointment();

-- ─────────────────────────────────────────────────────────────────────────────
-- 11) ANALYTICS (page/project views — real, privacy-respecting, no PII)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL,       -- 'page_view' | 'project_view' | 'enquiry' | 'booking'
  entity_type text,               -- 'project' | 'page'
  entity_id text,
  entity_slug text,
  referrer text,
  path text,
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics_events (view_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON public.analytics_events (entity_type, entity_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Analytics: authenticated read" ON public.analytics_events;
CREATE POLICY "Analytics: authenticated read" ON public.analytics_events
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Analytics: anon insert" ON public.analytics_events;
CREATE POLICY "Analytics: anon insert" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12) STORAGE — ensure bucket exists + keep policies
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-uploads', 'design-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read design-uploads" ON storage.objects;
CREATE POLICY "Public read design-uploads"
  ON storage.objects FOR SELECT USING (bucket_id = 'design-uploads');
DROP POLICY IF EXISTS "Authenticated upload design-uploads" ON storage.objects;
CREATE POLICY "Authenticated upload design-uploads"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'design-uploads' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated update design-uploads" ON storage.objects;
CREATE POLICY "Authenticated update design-uploads"
  ON storage.objects FOR UPDATE USING (bucket_id = 'design-uploads' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated delete design-uploads" ON storage.objects;
CREATE POLICY "Authenticated delete design-uploads"
  ON storage.objects FOR DELETE USING (bucket_id = 'design-uploads' AND auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- 13) updated_at triggers for new tables
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_clients_updated_at ON public.clients;
CREATE TRIGGER set_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_appointments_updated_at ON public.appointments;
CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_availability_updated_at ON public.availability;
CREATE TRIGGER set_availability_updated_at BEFORE UPDATE ON public.availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_settings_updated_at ON public.settings;
CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Done.
-- Next steps for the owner:
--   1) Edit the seed INSERT above to use your Supabase login email, OR run:
--      UPDATE public.profiles SET role='admin'
--      WHERE user_id = (SELECT id FROM auth.users WHERE email='YOUR_EMAIL');
--   2) Verify with: SELECT * FROM public.profiles;