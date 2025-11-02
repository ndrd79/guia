-- Migration: Enable RLS on audit_logs table
-- Description: Fix security issue where audit_logs table has RLS policies but RLS is not enabled
-- Date: 2025-01-30

-- Enable Row Level Security on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Verify that the policies exist and are correctly configured
-- The following policies should already exist:
-- 1. super_admin_can_view_all_audit_logs
-- 2. system_can_insert_audit_logs

-- Add a comment to document the security fix
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria do sistema - RLS habilitado para segurança';

-- Verify RLS is enabled (this will be checked after migration)
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename = 'audit_logs';