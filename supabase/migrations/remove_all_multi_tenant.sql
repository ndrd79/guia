-- Migration: Remove Multi-Tenant Functionality Completely (Version 2)
-- This script removes all multi-tenant related structures from the database

-- First, disable RLS on all tables to avoid policy conflicts
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classificados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_themes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.feira_produtor DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtores_feira DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_ad_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on tables with tenant_id (using CASCADE to remove dependencies)
DROP POLICY IF EXISTS "Users can view banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
DROP POLICY IF EXISTS "public_access_banners" ON public.banners;
DROP POLICY IF EXISTS "auth_insert_banners" ON public.banners;
DROP POLICY IF EXISTS "auth_update_banners" ON public.banners;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.banners;
DROP POLICY IF EXISTS "banners_public_read" ON public.banners;

DROP POLICY IF EXISTS "Users can view noticias" ON public.noticias;
DROP POLICY IF EXISTS "Admins can manage noticias" ON public.noticias;
DROP POLICY IF EXISTS "public_access_noticias" ON public.noticias;
DROP POLICY IF EXISTS "auth_insert_noticias" ON public.noticias;
DROP POLICY IF EXISTS "auth_update_noticias" ON public.noticias;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.noticias;
DROP POLICY IF EXISTS "noticias_public_read" ON public.noticias;

DROP POLICY IF EXISTS "Users can view empresas" ON public.empresas;
DROP POLICY IF EXISTS "Admins can manage empresas" ON public.empresas;
DROP POLICY IF EXISTS "public_access_empresas" ON public.empresas;
DROP POLICY IF EXISTS "auth_insert_empresas" ON public.empresas;
DROP POLICY IF EXISTS "auth_update_empresas" ON public.empresas;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.empresas;
DROP POLICY IF EXISTS "empresas_public_read" ON public.empresas;

DROP POLICY IF EXISTS "Users can view classificados" ON public.classificados;
DROP POLICY IF EXISTS "Admins can manage classificados" ON public.classificados;
DROP POLICY IF EXISTS "public_access_classificados" ON public.classificados;
DROP POLICY IF EXISTS "auth_insert_classificados" ON public.classificados;
DROP POLICY IF EXISTS "auth_update_classificados" ON public.classificados;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.classificados;
DROP POLICY IF EXISTS "classificados_public_read" ON public.classificados;

DROP POLICY IF EXISTS "Users can view eventos" ON public.eventos;
DROP POLICY IF EXISTS "Admins can manage eventos" ON public.eventos;
DROP POLICY IF EXISTS "public_access_eventos" ON public.eventos;
DROP POLICY IF EXISTS "auth_insert_eventos" ON public.eventos;
DROP POLICY IF EXISTS "auth_update_eventos" ON public.eventos;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.eventos;
DROP POLICY IF EXISTS "eventos_public_read" ON public.eventos;

-- Drop policies on other tables
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.seasonal_themes;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.feira_produtor;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.produtores_feira;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.banner_analytics;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.video_ads;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.video_ad_analytics;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.media_library;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.media_folders;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON public.audit_logs;

-- Remove foreign key constraints that reference tenants table
ALTER TABLE public.banners DROP CONSTRAINT IF EXISTS banners_tenant_id_fkey;
ALTER TABLE public.noticias DROP CONSTRAINT IF EXISTS noticias_tenant_id_fkey;
ALTER TABLE public.classificados DROP CONSTRAINT IF EXISTS classificados_tenant_id_fkey;
ALTER TABLE public.eventos DROP CONSTRAINT IF EXISTS eventos_tenant_id_fkey;
ALTER TABLE public.seasonal_themes DROP CONSTRAINT IF EXISTS seasonal_themes_tenant_id_fkey;
ALTER TABLE public.feira_produtor DROP CONSTRAINT IF EXISTS feira_produtor_tenant_id_fkey;
ALTER TABLE public.produtores_feira DROP CONSTRAINT IF EXISTS produtores_feira_tenant_id_fkey;
ALTER TABLE public.empresas DROP CONSTRAINT IF EXISTS empresas_tenant_id_fkey;
ALTER TABLE public.banner_analytics DROP CONSTRAINT IF EXISTS banner_analytics_tenant_id_fkey;
ALTER TABLE public.video_ads DROP CONSTRAINT IF EXISTS video_ads_tenant_id_fkey;
ALTER TABLE public.video_ad_analytics DROP CONSTRAINT IF EXISTS video_ad_analytics_tenant_id_fkey;
ALTER TABLE public.media_library DROP CONSTRAINT IF EXISTS media_library_tenant_id_fkey;
ALTER TABLE public.media_folders DROP CONSTRAINT IF EXISTS media_folders_tenant_id_fkey;
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_tenant_id_fkey;

-- Drop indexes related to tenant_id
DROP INDEX IF EXISTS idx_banners_tenant_id;
DROP INDEX IF EXISTS idx_noticias_tenant_id;
DROP INDEX IF EXISTS idx_classificados_tenant_id;
DROP INDEX IF EXISTS idx_eventos_tenant_id;
DROP INDEX IF EXISTS idx_seasonal_themes_tenant_id;
DROP INDEX IF EXISTS idx_feira_produtor_tenant_id;
DROP INDEX IF EXISTS idx_produtores_feira_tenant_id;
DROP INDEX IF EXISTS idx_empresas_tenant_id;
DROP INDEX IF EXISTS idx_banner_analytics_tenant_id;
DROP INDEX IF EXISTS idx_video_ads_tenant_id;
DROP INDEX IF EXISTS idx_video_ad_analytics_tenant_id;
DROP INDEX IF EXISTS idx_media_library_tenant_id;
DROP INDEX IF EXISTS idx_media_folders_tenant_id;
DROP INDEX IF EXISTS idx_audit_logs_tenant_id;

-- Remove tenant_id columns from all tables (using CASCADE to handle dependencies)
ALTER TABLE public.banners DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.noticias DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.classificados DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.eventos DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.seasonal_themes DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.feira_produtor DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.produtores_feira DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.empresas DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.banner_analytics DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.video_ads DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.video_ad_analytics DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.media_library DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.media_folders DROP COLUMN IF EXISTS tenant_id CASCADE;
ALTER TABLE public.audit_logs DROP COLUMN IF EXISTS tenant_id CASCADE;

-- Drop multi-tenant specific tables completely
DROP TABLE IF EXISTS public.user_tenants CASCADE;
DROP TABLE IF EXISTS public.tenant_pages CASCADE;
DROP TABLE IF EXISTS public.tenant_settings CASCADE;
DROP TABLE IF EXISTS public.available_pages CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Create simple public read policies for main content tables
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT USING (ativo = true);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "noticias_public_read" ON public.noticias FOR SELECT USING (workflow_status = 'published');

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "empresas_public_read" ON public.empresas FOR SELECT USING (true);

ALTER TABLE public.classificados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classificados_public_read" ON public.classificados FOR SELECT USING (true);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eventos_public_read" ON public.eventos FOR SELECT USING (true);

-- Re-enable RLS on tables that need it
ALTER TABLE public.seasonal_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seasonal_themes_public_read" ON public.seasonal_themes FOR SELECT USING (true);

ALTER TABLE public.feira_produtor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feira_produtor_public_read" ON public.feira_produtor FOR SELECT USING (true);

ALTER TABLE public.produtores_feira ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produtores_feira_public_read" ON public.produtores_feira FOR SELECT USING (true);

-- Comment to document the change
COMMENT ON SCHEMA public IS 'Schema converted from multi-tenant to single-tenant architecture';