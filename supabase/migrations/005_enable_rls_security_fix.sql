-- =====================================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA: HABILITAR RLS
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO:
-- As tabelas públicas estão expostas sem Row Level Security (RLS)
-- permitindo acesso total (CRUD) a qualquer pessoa com a URL do projeto
--
-- SOLUÇÃO:
-- Habilitar RLS nas tabelas que possuem políticas criadas mas não ativadas
--
-- Data: 2025-01-30
-- Prioridade: CRÍTICA
-- =====================================================

-- Habilitar RLS na tabela feira_produtor
-- Esta tabela possui as políticas:
-- - "Permitir leitura pública da feira"
-- - "Permitir todas as operações para admins na feira"
ALTER TABLE public.feira_produtor ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela produtores_feira  
-- Esta tabela possui as políticas:
-- - "Permitir leitura pública dos produtores"
-- - "Permitir todas as operações para admins nos produtores"
ALTER TABLE public.produtores_feira ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela empresas
-- Esta tabela está completamente exposta sem políticas ativas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAÇÃO DAS CORREÇÕES
-- =====================================================

-- Verificar se RLS foi habilitado corretamente
DO $$
BEGIN
    -- Verificar feira_produtor
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'feira_produtor' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        RAISE EXCEPTION 'ERRO: RLS não foi habilitado na tabela feira_produtor';
    END IF;
    
    -- Verificar produtores_feira
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'produtores_feira' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        RAISE EXCEPTION 'ERRO: RLS não foi habilitado na tabela produtores_feira';
    END IF;
    
    -- Verificar empresas
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'empresas' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        RAISE EXCEPTION 'ERRO: RLS não foi habilitado na tabela empresas';
    END IF;
    
    RAISE NOTICE 'SUCESSO: RLS habilitado em todas as tabelas críticas';
END $$;

-- =====================================================
-- COMENTÁRIOS IMPORTANTES
-- =====================================================

-- ATENÇÃO: Após aplicar esta migração:
-- 1. As políticas existentes nas tabelas feira_produtor e produtores_feira 
--    agora estarão ATIVAS e funcionando
-- 2. A tabela empresas precisará de políticas RLS criadas para permitir acesso
-- 3. Teste todas as funcionalidades do frontend para garantir que continuam funcionando
-- 4. Monitore os logs para identificar possíveis problemas de acesso

-- SEGURANÇA: Esta migração corrige vulnerabilidades críticas identificadas
-- pelo Security Advisor do Supabase que permitiam acesso total às tabelas públicas