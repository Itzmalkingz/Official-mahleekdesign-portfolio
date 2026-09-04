-- Mahleek Portfolio: Full Migration
-- Run entire file in Supabase SQL Editor (SQL Editor -> New query -> Paste -> Run)

-- 1) Ensure projects table exists (base)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL CHECK (category IN ('web','design')),
  image_url text DEFAULT '',
  images text[] DEFAULT '{}',
  live_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2) Create storage bucket for uploads (FIXES: StorageApiError: Bucket not found)
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-uploads', 'design-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read, authenticated upload/update/delete
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

-- 3) Add new columns for CMS functionality
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS case_study text DEFAULT '',
  ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}';

-- Create an index for sort ordering
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects (sort_order ASC, created_at DESC);

-- Create a function to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (if not already exists)
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
