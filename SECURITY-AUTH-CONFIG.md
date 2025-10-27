# 🛡️ CONFIGURAÇÕES DE SEGURANÇA DE AUTENTICAÇÃO - SUPABASE

## 📋 RESUMO DOS ALERTAS RESTANTES

Após corrigir as 5 funções com `search_path` vulnerável, restam **3 alertas de segurança** que precisam ser configurados manualmente no painel do Supabase:

### ✅ CORRIGIDO AUTOMATICAMENTE
- ✅ **Function Search Path Mutable** (5 funções) - Corrigido via migração SQL

### ⚠️ PENDENTE - CONFIGURAÇÃO MANUAL
- 🔐 **Leaked Password Protection Disabled**
- 🔑 **Insufficient MFA Options** 
- 🐘 **Vulnerable Postgres Version**

---

## 🔐 1. HABILITAR PROTEÇÃO CONTRA SENHAS VAZADAS

### **Problema:**
A proteção contra senhas comprometidas está desabilitada. O Supabase pode verificar senhas contra a base de dados HaveIBeenPwned.org.

### **Solução:**
1. Acesse o **Painel do Supabase** → Seu Projeto
2. Vá para **Authentication** → **Settings** → **Password Security**
3. Habilite **"Leaked Password Protection"**
4. Configure as opções:
   - ✅ **Enable leaked password protection**
   - ✅ **Block registration with leaked passwords**
   - ✅ **Block login with leaked passwords**

### **Configuração Recomendada:**
```json
{
  "password_security": {
    "leaked_password_protection": true,
    "block_registration_with_leaked_passwords": true,
    "block_login_with_leaked_passwords": true,
    "minimum_password_strength": "strong"
  }
}
```

---

## 🔑 2. CONFIGURAR OPÇÕES MFA ADICIONAIS

### **Problema:**
O projeto tem poucas opções de autenticação multifator (MFA) habilitadas.

### **Solução:**
1. Acesse **Authentication** → **Settings** → **Multi-Factor Authentication**
2. Habilite as seguintes opções:

#### **TOTP (Time-based One-Time Password)**
- ✅ Habilitar **TOTP MFA**
- Configurar aplicativos suportados: Google Authenticator, Authy, 1Password

#### **SMS MFA (Opcional)**
- ✅ Habilitar **SMS MFA** 
- Configurar provedor SMS (Twilio recomendado)
- Definir países permitidos

#### **Email MFA**
- ✅ Habilitar **Email MFA** como backup
- Configurar templates de email personalizados

### **Configuração Recomendada:**
```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "issuer": "Portal Maria Helena"
    },
    "sms": {
      "enabled": true,
      "provider": "twilio",
      "allowed_countries": ["BR"]
    },
    "email": {
      "enabled": true,
      "template": "custom_mfa_template"
    }
  }
}
```

---

## 🐘 3. UPGRADE DO POSTGRESQL

### **Problema:**
A versão atual do PostgreSQL (`supabase-postgres-17.4.1.064`) tem patches de segurança disponíveis.

### **Solução:**
⚠️ **IMPORTANTE:** Este upgrade deve ser feito com cuidado em ambiente de produção.

#### **Passos para Upgrade:**
1. **Backup Completo:**
   ```bash
   # Fazer backup completo do banco
   supabase db dump --file backup-pre-upgrade.sql
   ```

2. **Agendar Upgrade:**
   - Acesse **Settings** → **Database** → **Upgrade**
   - Escolha horário de menor tráfego
   - Agende o upgrade para a versão mais recente

3. **Pós-Upgrade:**
   - Verificar funcionamento de todas as funções
   - Testar autenticação e RLS
   - Monitorar logs por 24h

#### **Checklist Pré-Upgrade:**
- [ ] Backup completo realizado
- [ ] Testes em ambiente de staging
- [ ] Comunicação com usuários sobre manutenção
- [ ] Plano de rollback preparado

---

## 🔍 VERIFICAÇÃO FINAL

### **Script de Verificação:**
Execute este script para verificar o status das correções:

```sql
-- Verificar funções corrigidas
SELECT 
    proname as function_name,
    CASE 
        WHEN 'search_path=''' = ANY(proconfig) THEN '✅ CORRIGIDO'
        ELSE '❌ VULNERÁVEL'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND proname IN (
    'update_banner_video_analytics_updated_at',
    'update_video_ads_updated_at', 
    'get_video_ad_analytics_summary',
    'update_updated_at_column',
    'get_active_video_ads'
);

-- Verificar RLS habilitado
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ATIVO'
        ELSE '❌ RLS INATIVO'
    END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
AND tablename IN ('banners', 'banner_positions', 'noticias', 'empresas');
```

---

## 📊 CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Imediato (0-24h)**
- ✅ Correção de funções SQL (CONCLUÍDO)
- 🔐 Habilitar proteção contra senhas vazadas
- 🔑 Configurar TOTP MFA

### **Fase 2: Curto Prazo (1-7 dias)**
- 📱 Configurar SMS MFA (se necessário)
- 📧 Configurar Email MFA
- 🧪 Testes completos de segurança

### **Fase 3: Planejado (7-30 dias)**
- 🐘 Agendar upgrade do PostgreSQL
- 📋 Documentar novos procedimentos
- 🔄 Implementar monitoramento contínuo

---

## 🎯 RESULTADO ESPERADO

Após implementar todas as configurações:
- **100% de conformidade de segurança**
- **0 alertas no Security Advisor**
- **Proteção robusta contra ameaças**
- **Autenticação multifator completa**

---

## 📞 SUPORTE

Para dúvidas sobre implementação:
1. Consulte a [documentação oficial do Supabase](https://supabase.com/docs)
2. Verifique os logs de segurança regularmente
3. Mantenha backups atualizados

**Data da última atualização:** 30/01/2025
**Status:** Funções SQL corrigidas ✅ | Configurações Auth pendentes ⏳