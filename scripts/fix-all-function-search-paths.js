/**
 * Script para corrigir TODAS as funções com search_path vulnerável
 * 
 * Uso: node fix-all-function-search-paths.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log('🔐 Analisando funções com search_path vulnerável...\n');

    // Query para encontrar todas as funções vulneráveis
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
            SELECT 
                p.proname as function_name,
                pg_get_function_identity_arguments(p.oid) as args,
                CASE 
                    WHEN p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
                    THEN true
                    ELSE false
                END as has_search_path
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.prokind = 'f'
            ORDER BY p.proname;
        `
    });

    if (error) {
        console.log('⚠️  Não foi possível executar query automaticamente.\n');
        console.log('📋 Execute o seguinte SQL no Supabase SQL Editor:\n');
        generateManualSQL();
        return;
    }

    const vulnerable = data.filter(f => !f.has_search_path);
    const fixed = data.filter(f => f.has_search_path);

    console.log(`📊 Resultado da análise:`);
    console.log(`   ✅ Funções corrigidas: ${fixed.length}`);
    console.log(`   ⚠️  Funções vulneráveis: ${vulnerable.length}\n`);

    if (vulnerable.length > 0) {
        console.log('📋 SQL para corrigir funções vulneráveis:\n');
        console.log('-- Cole este SQL no Supabase SQL Editor:\n');

        vulnerable.forEach(f => {
            const args = f.args ? `(${f.args})` : '()';
            console.log(`ALTER FUNCTION public.${f.function_name}${args} SET search_path = '';`);
        });
    } else {
        console.log('✅ Todas as funções já estão corrigidas!');
    }
}

function generateManualSQL() {
    // SQL completo para corrigir as funções conhecidas
    const sql = `
-- =====================================================
-- PASSO 1: Execute esta query para ver funções vulneráveis
-- =====================================================

SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    'ALTER FUNCTION public.' || p.proname || 
    '(' || pg_get_function_identity_arguments(p.oid) || ') SET search_path = '''';' as fix_sql
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
AND (
    p.proconfig IS NULL 
    OR NOT array_to_string(p.proconfig, ',') LIKE '%search_path%'
)
ORDER BY p.proname;

-- =====================================================
-- PASSO 2: Copie os comandos da coluna "fix_sql" e execute
-- =====================================================

-- Ou execute estes comandos conhecidos:

ALTER FUNCTION IF EXISTS public.update_banner_slots_updated_at() SET search_path = '';
ALTER FUNCTION IF EXISTS public.update_banner_video_analytics_updated_at() SET search_path = '';
ALTER FUNCTION IF EXISTS public.approve_empresa(uuid) SET search_path = '';
ALTER FUNCTION IF EXISTS public.reject_empresa(uuid) SET search_path = '';
ALTER FUNCTION IF EXISTS public.set_current_tenant_id(uuid) SET search_path = '';
ALTER FUNCTION IF EXISTS public.update_media_usage_count() SET search_path = '';
ALTER FUNCTION IF EXISTS public.migrate_expired_premium_plans() SET search_path = '';
ALTER FUNCTION IF EXISTS public.is_premium_active(uuid) SET search_path = '';
ALTER FUNCTION IF EXISTS public.trigger_plan_migration() SET search_path = '';
ALTER FUNCTION IF EXISTS public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION IF EXISTS public.get_active_video_ads() SET search_path = '';
ALTER FUNCTION IF EXISTS public.get_video_ad_analytics_summary(uuid) SET search_path = '';
ALTER FUNCTION IF EXISTS public.update_video_ads_updated_at() SET search_path = '';
ALTER FUNCTION IF EXISTS public.handle_new_user() SET search_path = '';
`;

    console.log(sql);
}

main();
