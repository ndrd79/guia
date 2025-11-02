-- Script para verificar status RLS de todas as tabelas
-- Identifica tabelas com políticas RLS criadas mas sem RLS habilitado

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count,
  CASE 
    WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0 
    THEN 'PROBLEMA: Políticas existem mas RLS desabilitado'
    WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0 
    THEN 'OK: RLS habilitado com políticas'
    WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) = 0 
    THEN 'OK: Sem RLS e sem políticas'
    WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) = 0 
    THEN 'ATENÇÃO: RLS habilitado mas sem políticas'
    ELSE 'Status desconhecido'
  END as status_description
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY 
  CASE 
    WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0 
    THEN 1  -- Problemas primeiro
    ELSE 2
  END,
  tablename;

-- Consulta específica para mostrar apenas tabelas com problemas
SELECT 
  schemaname,
  tablename,
  'RLS DESABILITADO COM POLÍTICAS EXISTENTES' as problema,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as total_policies,
  (SELECT string_agg(policyname, ', ') FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_names
FROM pg_tables t
WHERE schemaname = 'public'
  AND rowsecurity = false 
  AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0
ORDER BY tablename;

-- Comando para habilitar RLS nas tabelas com problema
SELECT 
  'ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;' as fix_command
FROM pg_tables t
WHERE schemaname = 'public'
  AND rowsecurity = false 
  AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0
ORDER BY tablename;