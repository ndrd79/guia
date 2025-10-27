-- Remove video functionality from banners table
-- This migration removes all video-related columns from the banners table

-- Remove video-related columns from banners table
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_url;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_duration;
ALTER TABLE public.banners DROP COLUMN IF EXISTS autoplay;
ALTER TABLE public.banners DROP COLUMN IF EXISTS show_controls;
ALTER TABLE public.banners DROP COLUMN IF EXISTS muted;
ALTER TABLE public.banners DROP COLUMN IF EXISTS fallback_image_url;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_type;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_external_url;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_provider;
ALTER TABLE public.banners DROP COLUMN IF EXISTS video_external_id;

-- Update the tipo column check constraint to only allow 'estatico'
ALTER TABLE public.banners DROP CONSTRAINT IF EXISTS banners_tipo_check;
ALTER TABLE public.banners ADD CONSTRAINT banners_tipo_check 
  CHECK (tipo::text = 'estatico'::character varying::text);

-- Update existing records to ensure they are 'estatico'
UPDATE public.banners SET tipo = 'estatico' WHERE tipo != 'estatico';

-- Drop banner_video_analytics table if it exists
DROP TABLE IF EXISTS public.banner_video_analytics CASCADE;

-- Add comment to indicate video functionality has been removed
COMMENT ON TABLE public.banners IS 'Banner management table - video functionality removed, only static images supported';