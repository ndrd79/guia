# Política de Segurança - Guia Comercial

## 🛡️ Visão Geral

Este documento descreve as medidas de segurança implementadas no projeto Guia Comercial e as configurações recomendadas para manter a segurança da aplicação.

## ✅ Vulnerabilidades Corrigidas

### 1. Row Level Security (RLS)
- **Status**: ✅ Implementado
- **Descrição**: Habilitado RLS em todas as tabelas críticas
- **Tabelas protegidas**: `empresas`, `banners`, `noticias`, `classificados`, `eventos`, `profiles`, `user_profiles`
- **Benefício**: Controle granular de acesso aos dados por usuário

### 2. Search Path Mutável em Funções
- **Status**: ✅ Corrigido
- **Migração**: `006_fix_function_search_path.sql`
- **Funções corrigidas**:
  - `update_storage_stats`
  - `trigger_update_storage_stats`
  - `update_updated_at_column`
  - `update_seasonal_themes_updated_at`
  - `cleanup_old_data`
  - `handle_new_user`
- **Correção aplicada**: Adicionado `SET search_path = ''` e qualificação de schemas

### 3. Políticas de Segurança
- **Status**: ✅ Implementado
- **Descrição**: Políticas RLS configuradas para controle de acesso
- **Benefício**: Prevenção de acesso não autorizado aos dados

### 4. Políticas RLS da Tabela Empresas
- **Status**: ✅ Implementado
- **Migração**: `fix_empresas_rls.sql`
- **Data**: 2025-01-30
- **Políticas criadas**:
  1. **"Empresas ativas são visíveis publicamente"**
     - Tipo: SELECT
     - Condição: `ativo = true`
     - Permite: Leitura pública de empresas ativas no guia comercial
  
  2. **"Usuários autenticados podem gerenciar empresas"**
     - Tipo: ALL (SELECT, INSERT, UPDATE, DELETE)
     - Condição: `auth.role() = 'authenticated'`
     - Permite: Administração completa para usuários autenticados
  
  3. **"Usuários autenticados podem cadastrar empresas"**
     - Tipo: INSERT
     - Condição: `auth.role() = 'authenticated'`
     - Permite: Cadastro de novas empresas por usuários autenticados
- **Benefício**: Resolve alerta "RLS Enabled No Policy" e garante acesso seguro aos dados

## ⚠️ Configurações Pendentes

### 1. Proteção Contra Senhas Vazadas
- **Status**: ⚠️ Pendente
- **Ação necessária**: Habilitar no painel do Supabase
- **Localização**: Authentication > Settings > Password Security
- **Configuração**: Ativar "Leaked Password Protection"

### 2. Autenticação Multi-Fator (MFA)
- **Status**: ⚠️ Pendente
- **Ação necessária**: Configurar TOTP no painel do Supabase
- **Localização**: Authentication > Settings > Multi-Factor Authentication
- **Recomendação**: Habilitar TOTP (Authenticator Apps)

### 3. Upgrade do PostgreSQL
- **Status**: ⚠️ Pendente
- **Versão atual**: supabase-postgres-17.4.1.064
- **Ação necessária**: Atualizar para versão mais recente
- **Localização**: Settings > Database > Database Version

## 🔧 Configurações de Segurança Implementadas

### Variáveis de Ambiente
```env
# Configurações Supabase (já configuradas)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Políticas RLS Ativas
```sql
-- Exemplo de política implementada
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### Funções com Search Path Seguro
```sql
-- Exemplo de função corrigida
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
```

## 📋 Checklist de Segurança

### ✅ Implementado
- [x] Row Level Security habilitado
- [x] Políticas RLS configuradas
- [x] Search path seguro em funções
- [x] Conexões SSL/TLS
- [x] Validação de entrada de dados
- [x] Sanitização de queries

### ⚠️ Pendente
- [ ] Proteção contra senhas vazadas
- [ ] Autenticação multi-fator (MFA)
- [ ] Upgrade do PostgreSQL
- [ ] Rate limiting configurado
- [ ] Audit logs habilitados
- [ ] Alertas de segurança configurados

## 🚨 Relatório de Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Envie um email para: [seu-email-de-seguranca@exemplo.com]
3. Inclua uma descrição detalhada da vulnerabilidade
4. Aguarde nossa resposta antes de divulgar publicamente

## 📚 Recursos e Documentação

### Links Úteis
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Database Security Checklist](https://supabase.com/docs/guides/database/security)
- [Authentication Security](https://supabase.com/docs/guides/auth/security)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Documentação Interna
- [Recomendações de Segurança Detalhadas](./docs/SECURITY_RECOMMENDATIONS.md)
- [Guia de Configuração do Supabase](./docs/SUPABASE_SETUP.md)

## 🔄 Atualizações de Segurança

### Histórico de Correções
- **30/01/2025**: Corrigido search path mutável em 6 funções PostgreSQL
- **30/01/2025**: Implementado RLS em todas as tabelas críticas
- **30/01/2025**: Configuradas políticas de segurança

### Próximas Atualizações Planejadas
- **Fevereiro 2025**: Implementação de MFA
- **Fevereiro 2025**: Upgrade do PostgreSQL
- **Março 2025**: Configuração de audit logs

---

**Última atualização**: 30/01/2025  
**Responsável**: Equipe de Desenvolvimento  
**Próxima revisão**: 30/03/2025