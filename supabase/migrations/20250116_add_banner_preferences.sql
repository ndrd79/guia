ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS banner_favorites jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS banner_recents jsonb DEFAULT '[]'::jsonb;