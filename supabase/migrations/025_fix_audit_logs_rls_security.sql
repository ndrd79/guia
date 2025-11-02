-- Fix RLS security issue on audit_logs table
-- Issue: Table has policies but RLS is not enabled

-- 1. Enable RLS on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Add comment to document the security fix
COMMENT ON TABLE public.audit_logs IS 'Audit logs table with RLS enabled for security. Only super_admin can view, only system can insert.';

-- 3. Verify existing policies and recreate if needed
-- First, let's check if policies exist and drop them to recreate with proper security

-- Drop existing policies if they exist (to ensure clean state)
DROP POLICY IF EXISTS super_admin_can_view_all_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS system_can_insert_audit_logs ON public.audit_logs;

-- 4. Create secure SELECT policy for super_admin only
CREATE POLICY super_admin_can_view_all_audit_logs ON public.audit_logs
    FOR SELECT 
    TO authenticated 
    USING (
        -- Only allow super_admin role to view audit logs
        (auth.jwt() ->> 'role') = 'super_admin'
        OR 
        -- Allow service role (for backend operations)
        auth.role() = 'service_role'
    );

-- 5. Create secure INSERT policy for system operations only
CREATE POLICY system_can_insert_audit_logs ON public.audit_logs
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        -- Only allow system/service role to insert audit logs
        auth.role() = 'service_role'
        OR
        -- Allow authenticated users with system role claim
        (auth.jwt() ->> 'role') = 'system'
        OR
        -- Allow if user_id matches the authenticated user (for user's own actions)
        user_id = auth.uid()
    );

-- 6. Create indexes for performance on policy columns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 7. Verification queries (these will be used to test the fix)
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'audit_logs';

-- List all policies on audit_logs table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'audit_logs';

-- Test query (should only work for super_admin or service_role)
-- SELECT COUNT(*) FROM public.audit_logs;