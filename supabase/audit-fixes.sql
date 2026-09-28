-- =============================================================================
-- MAHLEEK DESIGN PORTFOLIO — Supabase Audit Fixes
-- Run in Supabase SQL Editor (Dashboard → SQL Editor)
-- Based on Supabase AI audit findings for project: fzgrcuynfrczpozwazte
-- =============================================================================

-- =============================================================================
-- 1. CREATE MISSING 'design-uploads' STORAGE BUCKET (PUBLIC)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'design-uploads',
  'design-uploads',
  true,                              -- PUBLIC bucket
  52428800,                          -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf'];

-- =============================================================================
-- 2. STORAGE POLICIES FOR 'design-uploads'
--    Note: The global policy "Public read all objects" (USING (true)) exists on storage.objects.
--    This affects ALL buckets. We keep it for backward compatibility but add
--    bucket-scoped policies for explicit control.
-- =============================================================================

-- 2a. Public read for design-uploads (explicit, bucket-scoped)
-- This is redundant with global policy but makes intent clear and survives global policy changes
DROP POLICY IF EXISTS "Public read design-uploads" ON storage.objects;
CREATE POLICY "Public read design-uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'design-uploads');

-- 2b. Authenticated INSERT for design-uploads (editors/admins only)
DROP POLICY IF EXISTS "Authenticated insert design-uploads" ON storage.objects;
CREATE POLICY "Authenticated insert design-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'design-uploads'
    AND auth.role() = 'authenticated'
    AND (public.is_admin() OR public.is_editor())
  );

-- 2c. Authenticated UPDATE for design-uploads (editors/admins only)
DROP POLICY IF EXISTS "Authenticated update design-uploads" ON storage.objects;
CREATE POLICY "Authenticated update design-uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'design-uploads'
    AND auth.role() = 'authenticated'
    AND (public.is_admin() OR public.is_editor())
  )
  WITH CHECK (
    bucket_id = 'design-uploads'
    AND auth.role() = 'authenticated'
    AND (public.is_admin() OR public.is_editor())
  );

-- 2d. Authenticated DELETE for design-uploads (admins only)
DROP POLICY IF EXISTS "Authenticated delete design-uploads" ON storage.objects;
CREATE POLICY "Authenticated delete design-uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'design-uploads'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );

-- =============================================================================
-- 3. PROJECTS TABLE — REPLACE BROAD "Authenticated full access" POLICY
--    Current policy: USING (auth.role() = 'authenticated') — allows ANY signed-in user full access
--    New policy: Gate with public.is_editor() (includes admins)
-- =============================================================================

-- 3a. Drop the overly broad policy
DROP POLICY IF EXISTS "Authenticated full access projects" ON public.projects;

-- 3b. Admin/Editor full access (CREATE, UPDATE, DELETE, SELECT all rows)
DROP POLICY IF EXISTS "Editor full access projects" ON public.projects;
CREATE POLICY "Editor full access projects"
  ON public.projects FOR ALL
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- 3c. Staff read access (can see all projects but not modify)
-- Optional: if you have 'staff' role that should view drafts
-- CREATE POLICY "Staff read projects"
--   ON public.projects FOR SELECT
--   USING (public.is_editor() OR EXISTS (
--     SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'staff'
--   ));

-- =============================================================================
-- 4. ADD MISSING updated_at TRIGGER TO PROJECTS TABLE
-- =============================================================================
-- Clean up duplicate triggers from previous migrations
DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 5. VERIFY PROJECT_PREVIEWS FOLDER ACCESS (if needed later)
--    No special policy needed for public bucket — public read covers it.
--    If bucket is made private later, add:
-- CREATE POLICY "Public read project-previews"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'design-uploads' AND name LIKE 'project-previews/%');

-- =============================================================================
-- 6. ORPHANED TABLES — DO NOT DROP YET
--    public.project_images and public.project_features exist with 0 rows.
--    Confirm no application code references them before dropping.
--    See: src/lib/types.ts (ProjectImage, ProjectFeature interfaces used in UI)
--    See: src/components/admin/ProjectForm.tsx (reads/writes projects.images JSONB)
--    See: supabase/migrations/001_admin_control_center.sql (backfill logic)
--    Decision: Keep for now; drop in future migration after code audit.
-- =============================================================================

-- =============================================================================
-- 7. VERIFICATION QUERIES (run after applying above)
-- =============================================================================

-- 7a. Verify bucket exists and is public
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'design-uploads';

-- 7b. Verify storage policies
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE '%design-uploads%';

-- 7c. Verify projects RLS policies
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'projects';

-- 7d. Verify updated_at trigger on projects
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'projects';

-- 7e. Verify is_admin/is_editor functions exist
SELECT proname, prosrc, prosecdef
FROM pg_proc
WHERE proname IN ('is_admin', 'is_editor', 'set_updated_at', 'handle_new_user')
  AND pronamespace = 'public'::regnamespace;

-- 7f. Check orphaned tables row counts (handle missing tables gracefully)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_images') THEN
    RAISE NOTICE 'project_images: % rows', (SELECT COUNT(*) FROM public.project_images);
  ELSE
    RAISE NOTICE 'project_images: table does not exist';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_features') THEN
    RAISE NOTICE 'project_features: % rows', (SELECT COUNT(*) FROM public.project_features);
  ELSE
    RAISE NOTICE 'project_features: table does not exist';
  END IF;
END $$;

-- =============================================================================
-- 8. SERVICE ROLE KEY — MANUAL STEP (cannot be done via SQL)
-- =============================================================================
-- Go to: Dashboard → Settings → API Keys → Legacy API Keys
-- Copy "service_role" key (starts with eyJ...)
-- Add to:
--   1. Vercel/Netlify Environment Variables as SUPABASE_SERVICE_ROLE_KEY
--   2. Local .env.local as SUPABASE_SERVICE_ROLE_KEY=your_key_here
--   3. GitHub Secrets if using CI/CD
--
-- This enables:
--   - /api/screenshot route (server-side uploads)
--   - Admin client operations (storage-server.ts, admin.ts)
--   - WebsitePreview.tsx manual upload
--   - ProjectImport.tsx screenshot capture

-- =============================================================================
-- 9. UPLOAD/GETPUBLICURL/HEAD TEST — MANUAL VERIFICATION
-- =============================================================================
-- After applying fixes and adding service role key:
-- 1. In Dashboard → Storage → design-uploads → Upload a test image (test.png)
-- 2. Click the file → Copy public URL
-- 3. In browser dev tools console:
--    fetch('YOUR_PUBLIC_URL', { method: 'HEAD' }).then(r => console.log(r.ok, r.status))
-- 4. Should return: true 200
-- 5. If 403/404: bucket not truly public or policy issue

-- =============================================================================
-- END OF AUDIT FIXES
-- =============================================================================