-- Migration 017: Remove Video Functionality
-- Remove all video-related tables, functions, and policies

-- Drop video-related functions first
DROP FUNCTION IF EXISTS public.update_banner_video_analytics_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_video_ads_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_video_ad_analytics_summary(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.get_active_video_ads(INTEGER) CASCADE;

-- Drop video-related tables
DROP TABLE IF EXISTS public.banner_video_analytics CASCADE;
DROP TABLE IF EXISTS public.video_ad_analytics CASCADE;
DROP TABLE IF EXISTS public.video_ads CASCADE;

-- Remove any video-related columns from existing tables if they exist
-- (This is safe to run even if columns don't exist)
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_url;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_type;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_duration;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_autoplay;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_muted;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_controls;

-- Clean up any remaining video-related policies
DROP POLICY IF EXISTS "Permitir leitura de video_ads para todos" ON public.video_ads;
DROP POLICY IF EXISTS "Permitir inserção de video_ad_analytics para autenticados" ON public.video_ad_analytics;
DROP POLICY IF EXISTS "Permitir leitura de video_ad_analytics para autenticados" ON public.video_ad_analytics;

-- Add comment
COMMENT ON SCHEMA public IS 'Video functionality completely removed from banner system';