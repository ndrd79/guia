-- Migration: Enable RLS on audit_logs table
-- Issue: Table has RLS policies but RLS is not enabled
-- Security Risk: Critical - Audit logs accessible without restrictions

-- Enable Row Level Security on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Add comment to document the security fix
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria do sistema - RLS habilitado para segurança crítica';

-- Verify current policies exist and are correct
-- Policy 1: super_admin_can_view_all_audit_logs (should allow SELECT for super_admin role)
-- Policy 2: system_can_insert_audit_logs (should allow INSERT for system/service role)

-- Check if policies need to be recreated with proper JWT claims
-- Note: Existing policies will be validated in separate verification script

-- Create index on user_id for policy performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Create index on created_at for policy performance (if not exists)  
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Verification query to confirm RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs') as policy_count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'audit_logs';