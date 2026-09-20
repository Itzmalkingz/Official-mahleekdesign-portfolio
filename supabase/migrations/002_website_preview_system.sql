-- =============================================================================
-- Mahleek Studio — Website Preview System (Phase 2)
-- Adds website screenshot/preview fields to projects table
-- Idempotent, additive. Safe to run multiple times. Preserves all existing data.
-- Run in the Supabase SQL Editor.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Add website preview columns to projects table
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS website_preview_url text,
  ADD COLUMN IF NOT EXISTS website_preview_status text NOT NULL DEFAULT 'not_generated'
      CHECK (website_preview_status IN ('not_generated', 'generating', 'ready', 'failed', 'manual')),
  ADD COLUMN IF NOT EXISTS website_preview_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS website_preview_viewport text NOT NULL DEFAULT 'desktop'
      CHECK (website_preview_viewport IN ('desktop', 'mobile')),
  ADD COLUMN IF NOT EXISTS website_preview_width integer,
  ADD COLUMN IF NOT EXISTS website_preview_height integer,
  ADD COLUMN IF NOT EXISTS website_preview_engine text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Create index for filtering by preview status
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_preview_status ON public.projects (website_preview_status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Create storage folder structure for website previews
--    Uses existing 'design-uploads' bucket with project-previews/{project-id}/ prefix
-- ─────────────────────────────────────────────────────────────────────────────
-- Note: Supabase Storage folders are virtual - they're created automatically when
-- files are uploaded with the path prefix.

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Optional: RLS policy for website preview updates
--    (Already covered by existing projects policies since these are columns on the same table)
-- ─────────────────────────────────────────────────────────────────────────────

-- Done.
-- The new columns:
--   website_preview_url       - Supabase Storage public URL for the generated screenshot
--   website_preview_status    - Current state: not_generated | generating | ready | failed | manual
--   website_preview_generated_at - When the preview was last successfully generated
--   website_preview_viewport  - Viewport used: desktop | mobile
--   website_preview_width     - Screenshot width in pixels
--   website_preview_height    - Screenshot height in pixels
--   website_preview_engine    - Generation engine: playwright | fallback | manual