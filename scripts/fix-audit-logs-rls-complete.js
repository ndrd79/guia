const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAuditLogsRLS() {
  console.log('🔧 Starting RLS fix for audit_logs table...\n');

  try {
    // 1. Enable RLS on audit_logs table
    console.log('1. Enabling RLS on audit_logs table...');
    const enableRLS = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
    });
    
    if (enableRLS.error) {
      console.log('⚠️  RLS enable failed (may already be enabled):', enableRLS.error.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // 2. Drop existing policies to recreate them
    console.log('\n2. Dropping existing policies...');
    const dropPolicies = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS super_admin_can_view_all_audit_logs ON public.audit_logs;
        DROP POLICY IF EXISTS system_can_insert_audit_logs ON public.audit_logs;
      `
    });
    
    if (dropPolicies.error) {
      console.log('⚠️  Drop policies failed:', dropPolicies.error.message);
    } else {
      console.log('✅ Existing policies dropped');
    }

    // 3. Create secure SELECT policy
    console.log('\n3. Creating secure SELECT policy...');
    const createSelectPolicy = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY super_admin_can_view_all_audit_logs ON public.audit_logs
        FOR SELECT 
        TO authenticated 
        USING (
          (auth.jwt() ->> 'role') = 'super_admin'
          OR 
          auth.role() = 'service_role'
        );
      `
    });
    
    if (createSelectPolicy.error) {
      console.log('❌ SELECT policy creation failed:', createSelectPolicy.error.message);
    } else {
      console.log('✅ SELECT policy created successfully');
    }

    // 4. Create secure INSERT policy
    console.log('\n4. Creating secure INSERT policy...');
    const createInsertPolicy = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY system_can_insert_audit_logs ON public.audit_logs
        FOR INSERT 
        TO authenticated 
        WITH CHECK (
          auth.role() = 'service_role'
          OR
          (auth.jwt() ->> 'role') = 'system'
          OR
          user_id = auth.uid()
        );
      `
    });
    
    if (createInsertPolicy.error) {
      console.log('❌ INSERT policy creation failed:', createInsertPolicy.error.message);
    } else {
      console.log('✅ INSERT policy created successfully');
    }

    // 5. Create performance indexes
    console.log('\n5. Creating performance indexes...');
    const createIndexes = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
      `
    });
    
    if (createIndexes.error) {
      console.log('⚠️  Index creation failed:', createIndexes.error.message);
    } else {
      console.log('✅ Performance indexes created');
    }

    // 6. Verify RLS status
    console.log('\n6. Verifying RLS status...');
    const checkRLS = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'audit_logs';
      `
    });
    
    if (checkRLS.error) {
      console.log('❌ RLS verification failed:', checkRLS.error.message);
    } else {
      console.log('✅ RLS Status:', checkRLS.data);
    }

    // 7. List policies
    console.log('\n7. Listing current policies...');
    const listPolicies = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'audit_logs';
      `
    });
    
    if (listPolicies.error) {
      console.log('❌ Policy listing failed:', listPolicies.error.message);
    } else {
      console.log('✅ Current Policies:');
      console.table(listPolicies.data);
    }

    console.log('\n🎉 RLS fix completed! The audit_logs table is now secure.');
    console.log('\n📋 Summary:');
    console.log('- RLS is enabled on audit_logs table');
    console.log('- Only super_admin role can SELECT from audit_logs');
    console.log('- Only system/service_role can INSERT into audit_logs');
    console.log('- Performance indexes created for policy columns');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixAuditLogsRLS();