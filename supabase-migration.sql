-- Mahleek Design: Clean Migration (drops and recreates incomplete tables)
-- Run entire file in Supabase SQL Editor
-- WARNING: This drops and recreates projects/project_images/project_features if they have wrong schema

-- 0) Drop incomplete tables and their dependents (safe if no data)
DROP TABLE IF EXISTS project_features CASCADE;
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 1) Projects table (clean create)
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  client text,
  industry text,
  category text NOT NULL CHECK (category IN ('brand-identity', 'web-systems', 'brand-web')),
  short_description text DEFAULT '',
  challenge text DEFAULT '',
  thinking text DEFAULT '',
  solution text DEFAULT '',
  outcome text DEFAULT '',
  cover_image text DEFAULT '',
  live_url text DEFAULT '',
  github_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  services text[] DEFAULT '{}',
  technologies text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  meta_title text,
  meta_description text,
  og_image text
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects (featured) WHERE featured = true;

-- 2) Project Images
CREATE TABLE IF NOT EXISTS public.project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images (project_id);

-- 3) Project Features
CREATE TABLE IF NOT EXISTS public.project_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_features_project ON project_features (project_id);

-- 4) Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business text NOT NULL,
  role text,
  content text NOT NULL,
  image_url text,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials (published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials (featured) WHERE featured = true;

-- 5) Enquiries
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  business text,
  project_type text NOT NULL CHECK (project_type IN ('brand-identity', 'web-systems', 'brand-web', 'business-website', 'custom', 'not-sure')),
  message text NOT NULL,
  budget text,
  timeline text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'discussion', 'won', 'closed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);

-- 6) Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_description text NOT NULL,
  full_description text,
  icon text,
  image_url text,
  features text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_published ON services (published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_services_sort ON services (sort_order ASC);

-- 7) Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-uploads', 'design-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read design-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload design-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update design-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete design-uploads" ON storage.objects;

CREATE POLICY "Public read design-uploads"
ON storage.objects FOR SELECT USING (bucket_id = 'design-uploads');

CREATE POLICY "Authenticated upload design-uploads"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'design-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update design-uploads"
ON storage.objects FOR UPDATE USING (bucket_id = 'design-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete design-uploads"
ON storage.objects FOR DELETE USING (bucket_id = 'design-uploads' AND auth.role() = 'authenticated');

-- 8) Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9) Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- 10) RLS Policies
CREATE POLICY "Public read published projects" ON projects FOR SELECT USING (published = true);
CREATE POLICY "Authenticated full access projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read project images" ON project_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_images.project_id AND projects.published = true)
);
CREATE POLICY "Authenticated full access project images" ON project_images FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read project features" ON project_features FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_features.project_id AND projects.published = true)
);
CREATE POLICY "Authenticated full access project features" ON project_features FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read published testimonials" ON testimonials FOR SELECT USING (published = true);
CREATE POLICY "Authenticated full access testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read enquiries" ON enquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update enquiries" ON enquiries FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Public read published services" ON services FOR SELECT USING (published = true);
CREATE POLICY "Authenticated full access services" ON services FOR ALL USING (auth.role() = 'authenticated');

-- 11) Default services
INSERT INTO services (name, short_description, full_description, features, sort_order, published) VALUES
('Brand Identity', 'Strategic visual identities that make businesses recognizable and memorable.', 'We create brand identities with a clear story, personality, and visual language — helping people recognize your business, understand what you stand for, and remember you.', ARRAY['Brand Strategy', 'Logo Systems', 'Typography', 'Color Systems', 'Brand Guidelines', 'Social Media Identity', 'Marketing Materials'], 1, true),
('Web Systems', 'Custom web applications that solve real business problems.', 'We design and build web systems around the way your business actually works — from booking and lead capture to dashboards, payments, customer experiences, and custom workflows.', ARRAY['Booking Systems', 'Lead Capture', 'Customer Portals', 'Admin Dashboards', 'Payment Integration', 'Custom Workflows', 'Business Applications'], 2, true),
('Brand + Web', 'A cohesive journey from brand identity to functional web system.', 'We build both — creating a consistent experience from the first impression to the moment a customer takes action. The brand informs the system; the system proves the brand.', ARRAY['Brand Strategy', 'Visual Identity', 'Web Experience', 'Web System', 'Unified Design Language'], 3, true)
ON CONFLICT DO NOTHING;
