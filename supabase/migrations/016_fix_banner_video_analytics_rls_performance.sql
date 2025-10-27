-- Migration 016: Fix Banner Video Analytics RLS Performance
-- Optimize RLS policy to use subquery for auth.uid() to improve performance

-- Drop the existing policy that uses direct auth.uid() call
DROP POLICY IF EXISTS "Permitir exclusão de analytics para autenticados" ON public.banner_video_analytics;

-- Create optimized policy using subquery for auth.uid()
-- This ensures auth.uid() is evaluated once per query instead of per row
CREATE POLICY "Permitir exclusão de analytics para autenticados" 
ON public.banner_video_analytics 
FOR DELETE 
USING (user_id = (SELECT auth.uid()));

-- Add comment explaining the optimization
COMMENT ON POLICY "Permitir exclusão de analytics para autenticados" ON public.banner_video_analytics 
IS 'Optimized RLS policy using subquery for auth.uid() to improve performance by evaluating auth function once per query instead of per row';