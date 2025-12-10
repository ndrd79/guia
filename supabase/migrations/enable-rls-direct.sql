-- Enable RLS on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Add comment to document the fix
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria do sistema - RLS habilitado para segurança';

-- Verify the change
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs') as policy_count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'audit_logs';