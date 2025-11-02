# Correção Manual do RLS para audit_logs

## Problema Identificado
A tabela `public.audit_logs` possui políticas RLS criadas, mas o RLS não está habilitado na tabela.

**Políticas existentes:**
- `super_admin_can_view_all_audit_logs`
- `system_can_insert_audit_logs`

**Status atual:** `rls_enabled: false` ❌

## Solução Manual Necessária

Como as ferramentas programáticas não conseguiram executar o comando SQL diretamente, é necessário habilitar o RLS manualmente através do Supabase Dashboard.

### Passos para Correção:

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione o projeto: `mlkpnapnijdbskaimquj`

2. **Navegue para o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Ou acesse diretamente: https://supabase.com/dashboard/project/mlkpnapnijdbskaimquj/sql

3. **Execute o Comando SQL:**
   ```sql
   -- Habilitar RLS na tabela audit_logs
   ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
   
   -- Adicionar comentário para documentar a correção
   COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria do sistema - RLS habilitado para segurança';
   
   -- Verificar se foi aplicado corretamente
   SELECT 
     schemaname, 
     tablename, 
     rowsecurity as rls_enabled,
     (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs') as policy_count
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'audit_logs';
   ```

4. **Verificar o Resultado:**
   - O comando deve retornar `rls_enabled: true`
   - Deve mostrar `policy_count: 2` (as duas políticas existentes)

### Verificação Adicional

Após executar o comando, você pode verificar se outras tabelas têm o mesmo problema executando:

```sql
SELECT 
  t.schemaname,
  t.tablename,
  t.rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) as policy_count,
  CASE 
    WHEN t.rowsecurity = false AND (SELECT count(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) > 0 
    THEN '❌ PROBLEMA: Políticas existem mas RLS desabilitado'
    WHEN t.rowsecurity = true AND (SELECT count(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) > 0 
    THEN '✅ OK: RLS habilitado com políticas'
    WHEN t.rowsecurity = false AND (SELECT count(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) = 0 
    THEN '⚪ OK: Sem RLS e sem políticas'
    WHEN t.rowsecurity = true AND (SELECT count(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) = 0 
    THEN '⚠️ ATENÇÃO: RLS habilitado mas sem políticas'
    ELSE 'Status desconhecido'
  END as status_description
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY 
  CASE 
    WHEN t.rowsecurity = false AND (SELECT count(*) FROM pg_policies p WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) > 0 
    THEN 1
    ELSE 2
  END,
  t.tablename;
```

## Arquivos Criados

Durante a tentativa de correção automática, foram criados os seguintes arquivos:

1. **Migração SQL:** `supabase/migrations/023_enable_rls_audit_logs.sql`
2. **Scripts de verificação:** 
   - `enable-rls-audit-logs.js`
   - `enable-rls-direct.sql`
   - `enable-rls-powershell.ps1`
   - `check-all-rls-issues.js`

## Próximos Passos

Após executar a correção manual:

1. ✅ Verificar se o RLS foi habilitado na tabela `audit_logs`
2. ✅ Testar se as políticas RLS funcionam corretamente
3. ✅ Verificar se outras tabelas têm problemas similares
4. ✅ Documentar a correção no sistema de auditoria

## Importância da Correção

Esta correção é **CRÍTICA** para a segurança do sistema, pois:

- A tabela `audit_logs` contém informações sensíveis de auditoria
- Sem RLS habilitado, as políticas de segurança não são aplicadas
- Isso pode permitir acesso não autorizado aos logs de auditoria
- É uma vulnerabilidade de segurança que deve ser corrigida imediatamente

---

**Status:** ⚠️ CORREÇÃO MANUAL NECESSÁRIA
**Prioridade:** 🔴 ALTA - SEGURANÇA CRÍTICA