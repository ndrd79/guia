# RLS Performance Optimization

## Problema Identificado

A política RLS "Permitir exclusão de analytics para autenticados" na tabela `public.banner_video_analytics` estava causando problemas de performance devido ao uso direto de `auth.uid()` na expressão da política.

### Detalhes do Problema

- **Tabela afetada**: `public.banner_video_analytics`
- **Política**: "Permitir exclusão de analytics para autenticados"
- **Problema**: Chamadas diretas para `auth.uid()` são re-avaliadas para cada linha, causando overhead de performance em escala

## Solução Implementada

### Migração 016: Fix Banner Video Analytics RLS Performance

**Arquivo**: `supabase/migrations/016_fix_banner_video_analytics_rls_performance.sql`

**Alterações realizadas**:

1. **Removida a política original**:
   ```sql
   DROP POLICY IF EXISTS "Permitir exclusão de analytics para autenticados" ON public.banner_video_analytics;
   ```

2. **Criada nova política otimizada**:
   ```sql
   CREATE POLICY "Permitir exclusão de analytics para autenticados" 
   ON public.banner_video_analytics 
   FOR DELETE 
   USING (user_id = (SELECT auth.uid()));
   ```

### Benefícios da Otimização

- **Performance melhorada**: `(SELECT auth.uid())` é avaliado uma única vez por consulta
- **Redução de overhead**: Elimina re-avaliações desnecessárias por linha
- **Escalabilidade**: Melhor performance em consultas que afetam muitas linhas

## Padrão Recomendado

Para futuras políticas RLS, sempre usar subqueries para funções de autenticação:

### ❌ Evitar (ineficiente):
```sql
USING (user_id = auth.uid())
USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
```

### ✅ Usar (otimizado):
```sql
USING (user_id = (SELECT auth.uid()))
USING (tenant_id = (SELECT (auth.jwt() ->> 'tenant_id'))::uuid)
```

## Verificação

A correção foi aplicada com sucesso em: **[Data da aplicação]**

Para verificar se outras políticas precisam de otimização similar, execute:

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    definition
FROM pg_policies 
WHERE definition LIKE '%auth.%' 
AND definition NOT LIKE '%(SELECT auth.%';
```

## Monitoramento

- Monitore a performance das consultas DELETE na tabela `banner_video_analytics`
- Use `EXPLAIN ANALYZE` para verificar melhorias no plano de execução
- Considere indexação adicional na coluna `user_id` se necessário

## Referências

- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/auth/row-level-security#performance-considerations)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)