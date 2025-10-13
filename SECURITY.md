# 🔒 Guia de Segurança - Portal Maria Helena

## ⚠️ IMPORTANTE: Proteção de Chaves de API

### 🚨 **NUNCA FAÇA ISSO:**
```javascript
// ❌ ERRADO - Chaves expostas no código
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const apiKey = 'd3ef9852b52357500adbce61ec2e3a0e';
```

### ✅ **SEMPRE FAÇA ISSO:**
```javascript
// ✅ CORRETO - Use variáveis de ambiente
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

// Validação de segurança
if (!supabaseKey) {
  console.error('❌ ERRO: Variável de ambiente não configurada');
  process.exit(1);
}
```

## 📁 Arquivos Protegidos

### `.env.local` - NUNCA COMMITAR
```bash
# Este arquivo contém informações sensíveis
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
NEXT_PUBLIC_OPENWEATHER_API_KEY=sua_chave_weather_aqui
```

### `.gitignore` - Proteção Ativa
```bash
# Arquivos protegidos automaticamente
.env.local          ✅ Protegido
.env.development.local  ✅ Protegido
.env.production.local   ✅ Protegido
```

## 🛡️ Camadas de Segurança

### 1. **Nível Repositório**
- ✅ `.env.local` no `.gitignore`
- ✅ Chaves removidas do código
- ✅ Validação de variáveis de ambiente

### 2. **Nível Supabase**
- ✅ RLS (Row Level Security) ativo
- ✅ Políticas de acesso configuradas
- ✅ Autenticação obrigatória para admin

### 3. **Nível Deploy**
- ✅ Variáveis configuradas no Vercel
- ✅ Separação entre desenvolvimento/produção

## 🔧 Scripts Seguros

Todos os scripts agora usam variáveis de ambiente:
- `setup-database-complete.js` ✅
- `check-feira-data.js` ✅
- `debug-banners.js` ✅
- Outros scripts de teste ✅

## 📝 Checklist de Segurança

Antes de fazer commit, verifique:

- [ ] Nenhuma chave de API no código
- [ ] `.env.local` não está sendo commitado
- [ ] Scripts usam `process.env.VARIAVEL`
- [ ] Validação de variáveis implementada
- [ ] Documentação de segurança atualizada

## 🚨 Em Caso de Exposição Acidental

Se uma chave foi exposta no Git:

1. **Regenerar chaves imediatamente** no Supabase
2. **Atualizar `.env.local`** com novas chaves
3. **Atualizar variáveis no Vercel**
4. **Verificar logs** para uso não autorizado

## 📞 Contato de Segurança

Para reportar vulnerabilidades:
- Email: admin@mariahelenapor.com
- Prioridade: ALTA para questões de segurança

---
**Última atualização:** Janeiro 2025
**Status:** 🔒 Seguro