/**
 * Script para habilitar RLS na tabela banner_templates
 * 
 * Uso: node enable-rls-banner-templates.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    console.error('   Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function enableRLS() {
    console.log('🔐 Habilitando RLS na tabela banner_templates...\n');

    try {
        // 1. Habilitar RLS na tabela
        console.log('1. Habilitando Row Level Security...');
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.banner_templates ENABLE ROW LEVEL SECURITY;'
        });

        if (rlsError) {
            // Tentar método alternativo via query direta
            console.log('   Tentando método alternativo...');

            // Usar a API REST do Supabase para executar SQL
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sql: 'ALTER TABLE public.banner_templates ENABLE ROW LEVEL SECURITY;'
                })
            });

            if (!response.ok) {
                console.log('   ⚠️  Função exec_sql não disponível.');
                console.log('   📋 Execute manualmente no Supabase SQL Editor:\n');
                console.log('   ALTER TABLE public.banner_templates ENABLE ROW LEVEL SECURITY;');
                console.log('\n');
            }
        } else {
            console.log('   ✅ RLS habilitado com sucesso!');
        }

        // 2. Verificar se a política de leitura pública existe
        console.log('\n2. Verificando políticas existentes...');
        const { data: policies, error: policiesError } = await supabase
            .from('banner_templates')
            .select('*')
            .limit(1);

        if (!policiesError) {
            console.log('   ✅ Acesso à tabela funcionando');
        } else {
            console.log('   ⚠️  Erro ao acessar tabela:', policiesError.message);
        }

        // 3. Mostrar instruções para aplicar manualmente
        console.log('\n' + '='.repeat(60));
        console.log('📋 INSTRUÇÕES PARA APLICAR NO SUPABASE SQL EDITOR:');
        console.log('='.repeat(60));
        console.log(`
1. Acesse: ${supabaseUrl.replace('.supabase.co', '')}/project/default/sql/new

2. Execute o seguinte SQL:

-- Habilitar RLS
ALTER TABLE public.banner_templates ENABLE ROW LEVEL SECURITY;

-- Criar política de leitura pública (se não existir)
CREATE POLICY IF NOT EXISTS "Permitir leitura publica de templates"
    ON public.banner_templates
    FOR SELECT
    TO public
    USING (true);

3. Clique em "Run" para executar

4. Verifique no lint do Supabase se os erros foram resolvidos
`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

enableRLS();
