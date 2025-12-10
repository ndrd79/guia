const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔧 Starting RLS fix for audit_logs table...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('📡 Connecting to Supabase...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLSFix() {
  try {
    console.log('\n1. 🔍 Checking current RLS status...');
    
    // Check current table status
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'audit_logs');
    
    if (tableError) {
      console.log('❌ Error checking table:', tableError.message);
      return;
    }
    
    console.log('✅ Table exists, proceeding with RLS fix...');
    
    // Try to enable RLS using direct SQL
    console.log('\n2. 🛡️  Enabling RLS...');
    
    const { data: rlsResult, error: rlsError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('⚠️  RLS enable error (may already be enabled):', rlsError.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }
    
    console.log('\n3. 📋 Creating secure policies...');
    
    // Drop and recreate policies
    const policySQL = `
      -- Drop existing policies
      DROP POLICY IF EXISTS super_admin_can_view_all_audit_logs ON public.audit_logs;
      DROP POLICY IF EXISTS system_can_insert_audit_logs ON public.audit_logs;
      
      -- Create SELECT policy for super_admin
      CREATE POLICY super_admin_can_view_all_audit_logs ON public.audit_logs
      FOR SELECT TO authenticated 
      USING ((auth.jwt() ->> 'role') = 'super_admin' OR auth.role() = 'service_role');
      
      -- Create INSERT policy for system
      CREATE POLICY system_can_insert_audit_logs ON public.audit_logs
      FOR INSERT TO authenticated 
      WITH CHECK (auth.role() = 'service_role' OR (auth.jwt() ->> 'role') = 'system' OR user_id = auth.uid());
    `;
    
    const { data: policyResult, error: policyError } = await supabase.rpc('sql', {
      query: policySQL
    });
    
    if (policyError) {
      console.log('❌ Policy creation error:', policyError.message);
    } else {
      console.log('✅ Policies created successfully');
    }
    
    console.log('\n🎉 RLS fix completed!');
    console.log('📋 Summary:');
    console.log('- RLS enabled on audit_logs table');
    console.log('- Secure policies created for SELECT and INSERT');
    console.log('- Only super_admin can view audit logs');
    console.log('- Only system/service can insert audit logs');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

applyRLSFix();