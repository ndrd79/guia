# 🔍 Relatório de Auditoria - Portal Maria Helena

**Data:** 10/12/2024  
**Versão do Projeto:** guia-comercio

---

## 📊 Resumo Executivo

Esta auditoria identificou **42 problemas** classificados por severidade:

| Severidade | Quantidade |
|------------|------------|
| 🔴 Crítico | 5 |
| 🟠 Alto | 12 |
| 🟡 Médio | 15 |
| 🟢 Baixo | 10 |

### ✅ CORREÇÕES JÁ IMPLEMENTADAS (10/12/2024)

| Status | Correção |
|--------|----------|
| ✅ | Removido `pages/admin/bypass.tsx` (credenciais expostas) |
| ✅ | Removido `pages/admin/login-simple.tsx` (bypass de auth) |
| ✅ | Removido `pages/admin/login-fixed.tsx` (duplicado) |
| ✅ | Removido `pages/admin/login-no-redirect.tsx` (duplicado) |
| ✅ | Removido `pages/admin/test-auth.tsx` (página de teste) |
| ✅ | Removido `pages/admin/test-login.tsx` (página de teste) |
| ✅ | Removido `pages/admin/redirect-stable.tsx` (duplicado) |
| ✅ | Removido `pages/admin/banners-original-backup.tsx` (backup 92KB) |
| ✅ | Removido `pages/test-analytics.tsx` (página de teste) |
| ✅ | Removido `pages/test-autoformat.tsx` (página de teste) |
| ✅ | Removido `pages/diag-noticias.tsx` (diagnóstico exposto) |
| ✅ | Removido `pages/area-usuario.tsx` (duplicado) |
| ✅ | `pages/api/admin/media.ts` - Adicionada autenticação admin |
| ✅ | `pages/api/admin/usuarios.ts` - Migrada para withAdminAuth |
| ✅ | `pages/api/admin/diagnostico.ts` - Protegida com withAdminAuth |
| ✅ | `pages/admin/login.tsx` - Removido signOut automático |

**Arquivos movidos para:** `_backup_deletados_audit/` (não deletados permanentemente)

### ✅ CORREÇÕES ADICIONAIS (14/12/2024)

| Status | Correção |
|--------|----------|
| ✅ | Removido `pages/api/test-auth.ts` (API de teste exposta) |
| ✅ | Removido `pages/api/banners/create-test.ts` (criava banners fake) |
| ✅ | Removido `pages/minha-conta.tsx` (só fazia redirect) |
| ✅ | Removido `.eslintrc.json` (conflito com eslint.config.js) |
| ✅ | Adicionado redirect `/minha-conta` → `/area-usuario` em `next.config.js` |

**Total de arquivos no backup:** 15 arquivos

### ✅ LIMPEZA DE CONSOLE.LOG (14/12/2024)

| Status | Arquivo |
|--------|---------|
| ✅ | `components/NewsCard.tsx` - Removido log de debug |
| ✅ | `components/OptimizedImage.tsx` - Removido logs de loading |
| ✅ | `components/BannerAd.tsx` - Removido logs de clique |
| ✅ | `components/banners/BannerSlot.tsx` - Removido log de posição |
| ✅ | `components/admin/ImageUploader.tsx` - Removido logs de upload |
| ✅ | `pages/admin/login.tsx` - Removido log de redirect |
| ✅ | `components/ImageTest.tsx` - Movido para backup (componente de teste) |
| ✅ | `pages/api/cadastro-empresa.ts` - Removido logs de debug |
| ✅ | `pages/api/analytics/track.ts` - Removido log de tracking |
| ✅ | `pages/api/admin/empresas/index.ts` - Removido logs de auth |

**Status:** Reduzido de ~50 para ~9 arquivos com console.log

### ✅ AUDITORIA LIB/UTILS (14/12/2024)

| Status | Arquivo | Motivo |
|--------|---------|--------|
| ✅ | `lib/auth.ts` | Arquivo vazio (apenas comentário), movido para backup |
| ✅ | `lib/database-config.js` | Duplica supabase.ts, 0 imports, movido para backup |
| ⏸️ | `lib/prisma.ts` | Não usado, mas mantido (pode ser útil futuramente) |

**Total de arquivos no backup:** 18 arquivos

### ✅ AUDITORIA BANCO DE DADOS (14/12/2024)

| Status | Item | Ação |
|--------|------|------|
| ✅ | `migrations/` (raiz) | 6 arquivos movidos para `supabase/migrations/`, pasta removida |
| ✅ | `supabase/migrations/` | Agora contém todas as 97 migrations organizadas |
| ℹ️ | `prisma/schema.prisma` | Schema introspectado do banco (78KB) - útil para referência |

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. Página de Bypass com Credenciais Hardcoded
**Arquivo:** `pages/admin/bypass.tsx`

⚠️ **VULNERABILIDADE DE SEGURANÇA CRÍTICA**

Esta página contém credenciais de admin em texto plano:
```typescript
email: 'admin@portal.com',
password: '123456'
```

**Risco:** Qualquer pessoa que acesse `/admin/bypass` pode fazer login como admin.

**Ação recomendada:** DELETAR IMEDIATAMENTE este arquivo.

---

### 2. Página login-simple.tsx com Bypass de Autenticação
**Arquivo:** `pages/admin/login-simple.tsx`

Esta página simula login sem verificação real:
```typescript
// Simulação de login bem-sucedido
console.log('Login attempt:', { email, password })
router.push('/admin')
```

**Risco:** Bypass completo de autenticação.

**Ação recomendada:** DELETAR este arquivo.

---

### 3. API Route `/api/admin/media.ts` sem Autenticação
**Arquivo:** `pages/api/admin/media.ts`

Esta API não usa `withAdminAuth` e não verifica autenticação:
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    // SEM VERIFICAÇÃO DE AUTENTICAÇÃO
    switch (method) {
```

**Risco:** Qualquer pessoa pode fazer upload/deletar arquivos de mídia.

**Ação recomendada:** Implementar `withAdminAuth`.

---

### 4. API Route `/api/admin/diagnostico.ts` Expõe Configuração do Sistema
**Arquivo:** `pages/api/admin/diagnostico.ts`

Expõe informações sensíveis sobre configuração:
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL_present": true,
    "SUPABASE_SERVICE_ROLE_KEY_present": true
  }
}
```

**Risco:** Atacantes podem usar isso para reconhecimento.

**Ação recomendada:** Proteger com autenticação ou remover.

---

### 5. Múltiplas Páginas de Teste Expostas em Produção
**Arquivos Afetados:**
- `pages/admin/test-auth.tsx`
- `pages/admin/test-login.tsx`
- `pages/test-analytics.tsx`
- `pages/test-autoformat.tsx`
- `pages/diag-noticias.tsx`

Essas páginas contêm credenciais e expõem lógica interna.

**Ação recomendada:** DELETAR todas estas páginas de teste.

---

## 🟠 PROBLEMAS DE ALTA SEVERIDADE

### 6. Páginas de Login Duplicadas (Confusão e Manutenção)
**Arquivos Duplicados:**
```
pages/admin/login.tsx          <- ATIVO
pages/admin/login-fixed.tsx    <- DUPLICADO
pages/admin/login-no-redirect.tsx <- DUPLICADO
pages/admin/login-simple.tsx   <- PERIGOSO
```

**Problemas:**
- Código duplicado dificulta manutenção
- Versões diferentes podem ter comportamentos inconsistentes
- Login-simple é um bypass de segurança

**Ação recomendada:** Manter apenas `login.tsx` e deletar os demais.

---

### 7. Páginas de Redirect Duplicadas
**Arquivos Duplicados:**
```
pages/admin/redirect.tsx
pages/admin/redirect-stable.tsx
```

**Ação recomendada:** Consolidar em um único arquivo ou remover se não usado.

---

### 8. Arquivo de Backup Gigante no Código Fonte
**Arquivo:** `pages/admin/banners-original-backup.tsx` (94KB!)

Este é um backup de código antigo que:
- Aumenta o bundle size
- Pode causar confusão
- Pode ter vulnerabilidades antigas

**Ação recomendada:** Mover para fora do diretório `pages/` ou deletar.

---

### 9. API Routes de Admin sem `withAdminAuth`
**APIs Vulneráveis:**
```
pages/api/admin/usuarios.ts   <- Autenticação manual inconsistente
pages/api/admin/media.ts      <- SEM qualquer autenticação
pages/api/admin/diagnostico.ts <- Parcialmente protegido
```

**APIs Corretas (usar como exemplo):**
```
pages/api/admin/banners.ts    <- Usa withAdminAuth ✅
pages/api/admin/noticias.ts   <- Usa withAdminAuth ✅
```

**Ação recomendada:** Migrar todas as APIs admin para usar `withAdminAuth`.

---

### 10. API `/api/admin/usuarios.ts` Usa `supabase.auth.admin.*`
**Arquivo:** `pages/api/admin/usuarios.ts`

```typescript
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
```

Isso funciona apenas com `service_role_key`, mas a API está usando o cliente `supabase` do browser:
```typescript
import { supabase } from '../../../lib/supabase'
```

**Problema:** O cliente de browser não tem acesso às funções admin.

**Ação recomendada:** Criar cliente com `SUPABASE_SERVICE_ROLE_KEY`.

---

### 11. Problema de SSR/CSR no Login
**Arquivo:** `pages/admin/login.tsx` (linhas 32-37)

```typescript
// Limpar qualquer sessão existente ao carregar a página
const clearSession = async () => {
  await supabase.auth.signOut()
}
clearSession()
```

**Problema:** Este código faz signOut toda vez que a página carrega, o que:
- Pode causar loops de logout
- Quebra o fluxo de redirecionamento após login

**Ação recomendada:** Remover este código.

---

### 12. Funções Definidas Dentro do Componente Sem useCallback (PageBanner.tsx)
**Arquivo:** `components/PageBanner.tsx` (linhas 102-125)

```typescript
const trackImpression = async (bannerId: string) => { ... }
const trackClick = async (bannerId: string) => { ... }
```

**Problema:** Funções assíncronas redefinidas a cada renderização, podendo causar re-renders desnecessários.

**Ação recomendada:** Usar `useCallback` para memoização ou mover para fora do componente.

---

### 13. Duplicação de Lógica: `area-usuario.tsx` vs `area-usuario/index.tsx`
**Arquivos:**
```
pages/area-usuario.tsx        <- Versão CSR com useEffect
pages/area-usuario/index.tsx  <- Versão SSR com getServerSideProps
```

**Problema:** 
- Duas páginas para a mesma rota `/area-usuario`
- Lógica duplicada
- Comportamentos diferentes (CSR vs SSR)

**Ação recomendada:** 
- Manter apenas `pages/area-usuario/index.tsx` (SSR)
- Deletar `pages/area-usuario.tsx`

---

### 14. Página minha-conta.tsx Desnecessária
**Arquivo:** `pages/minha-conta.tsx`

```typescript
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/area-usuario',
      permanent: false,
    }
  }
}
```

**Problema:** Esta página apenas redireciona. Poderia ser configurada em `next.config.js`.

**Ação recomendada:** Usar redirects no next.config.js e deletar o arquivo.

---

### 15. Imports Redundantes no lib/supabase.ts
**Arquivo:** `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { createServerClient, createBrowserClient } from '@supabase/ssr'
```

`createClient` é importado mas só usado como fallback. Podereria ser removido.

---

### 16. Fluxo de Autenticação Inconsistente
**Problema:** O middleware e as páginas de login tratam autenticação de formas diferentes:

- **Middleware:** Usa `createServerClient` do `@supabase/ssr`
- **Páginas:** Usam `supabase` do browser (`createBrowserClient`)
- **APIs Admin:** Misturam `supabase` browser e cliente com service_role

**Ação recomendada:** Padronizar o fluxo de autenticação.

---

### 17. Rate Limiting Incompleto
**Arquivo:** `middleware.ts`

O middleware não implementa rate limiting, permitindo ataques de força bruta.

**Ação recomendada:** Implementar rate limiting para rotas `/admin/login`.

---

## 🟡 PROBLEMAS DE MÉDIA SEVERIDADE

### 18. Console.log em Produção
**Múltiplos arquivos** contêm `console.log` e `console.error`:
- `pages/admin/login.tsx`
- `pages/admin/redirect.tsx`
- `components/HeroBanner.tsx`
- `components/SecondaryBanner.tsx`

**Ação recomendada:** Usar o Logger centralizado (`lib/logger.ts`).

---

### 19. useEffect sem Cleanup para Interval
**Arquivos Corretos (com cleanup):**
- `components/PageBanner.tsx` ✅
- `components/HeroBanner.tsx` ✅
- `components/SecondaryBanner.tsx` ✅

Todos os setIntervals verificados têm cleanup adequado.

---

### 20. Possível Memory Leak em Event Listeners
**Arquivo:** `components/banners/templates/StaticTemplate.tsx` (linha 35)

Verificar se há cleanup correto:
```typescript
window.addEventListener('resize', checkMobile)
// Precisa ter:
return () => window.removeEventListener('resize', checkMobile)
```

---

### 21. Uso de `any` Type
**Arquivos Afetados:**
- `pages/diag-noticias.tsx`: `{ data }: any`
- `pages/test-analytics.tsx`: `useState<any[]>([])`
- `pages/admin/test-auth.tsx`: `useState<any>(null)`

**Ação recomendada:** Criar interfaces TypeScript adequadas.

---

### 22. Timeout Hardcoded
**Arquivo:** `pages/admin/login.tsx` (linha 136)

```typescript
await new Promise(resolve => setTimeout(resolve, 500))
```

**Problema:** Delays fixos causam UX ruim e não garantem que a operação terminou.

**Ação recomendada:** Usar eventos/callbacks ao invés de delays fixos.

---

### 23. Imports de Logger Inconsistentes
**Alguns arquivos usam:**
```typescript
import { log } from './lib/logger'
```

**Outros usam:**
```typescript
import { logger } from './lib/logger'
```

**Ação recomendada:** Padronizar para uma única exportação.

---

### 24. Arquivos .js de Scripts na Raiz
**Arquivos na raiz:**
```
check-all-banners.js
debug-banners.js
test-*.js (muitos)
verify-*.js (muitos)
```

Total: ~60 scripts de manutenção na raiz.

**Ação recomendada:** Mover para pasta `scripts/` ou `tools/`.

---

### 25-32. Arquivos .sql na Raiz
Múltiplos arquivos SQL na raiz que deveriam estar em `supabase/migrations/`:
```
add-destaque-field.sql
create-admin-user.sql
enable-rls-direct.sql
fix-*.sql
```

---

### 33. Arquivos de Documentação Demais na Raiz
**Arquivos Markdown na raiz (17 arquivos):**
```
ADMIN-SETUP.md
ARQUITETURA-OTIMIZACAO-BANNERS.md
BANNER-UX-IMPROVEMENT-STATUS.md
... etc
```

**Ação recomendada:** Mover para pasta `docs/`.

---

## 🟢 PROBLEMAS DE BAIXA SEVERIDADE

### 34. Arquivo middleware-backup.ts
**Arquivo:** `middleware-backup.ts`

Contém apenas:
```typescript
export {}
```

**Ação recomendada:** Deletar arquivo.

---

### 35. Arquivo auth.ts Vazio
**Arquivo:** `lib/auth.ts`

```typescript
// Content not verified, but flagged as 38 bytes - likely empty or stub
```

**Ação recomendada:** Verificar se está em uso ou deletar.

---

### 36. Arquivos .txt na Raiz
```
BD_Supa.txt
codigo-painel-banners.txt
Novo Documento de Texto.txt
```

**Ação recomendada:** Organizar ou deletar.

---

### 37. Template Files Duplicados
```
template_test.csv
template_test.xlsx
template_test_improved.xlsx
test_download.csv
test_download.xlsx
test_improved.xlsx
```

**Ação recomendada:** Manter apenas necessários em `public/templates/`.

---

### 38-42. Arquivos de Configuração Duplicados/Legados
- `.env` e `.env.local` (manter apenas `.env.local`)
- Múltiplos arquivos PowerShell (`.ps1`)
- Arquivos de configuração de deploy duplicados

---

## 📋 LISTA DE AÇÕES RECOMENDADAS

### Prioridade 1 - Segurança (FAZER AGORA)
1. ❗ DELETAR `pages/admin/bypass.tsx`
2. ❗ DELETAR `pages/admin/login-simple.tsx`
3. ❗ DELETAR `pages/admin/test-auth.tsx`
4. ❗ DELETAR `pages/admin/test-login.tsx`
5. ❗ DELETAR `pages/test-analytics.tsx`
6. ❗ DELETAR `pages/test-autoformat.tsx`
7. ❗ DELETAR `pages/diag-noticias.tsx`
8. ❗ Adicionar autenticação a `pages/api/admin/media.ts`
9. ❗ Migrar `pages/api/admin/usuarios.ts` para `withAdminAuth`
10. ❗ Proteger ou remover `pages/api/admin/diagnostico.ts`

### Prioridade 2 - Limpeza de Código
11. DELETAR `pages/admin/login-fixed.tsx`
12. DELETAR `pages/admin/login-no-redirect.tsx`
13. DELETAR `pages/admin/redirect-stable.tsx`
14. MOVER `pages/admin/banners-original-backup.tsx` para fora de pages/
15. DELETAR `pages/area-usuario.tsx` (manter apenas index.tsx)
16. REMOVER signOut automático em `pages/admin/login.tsx`

### Prioridade 3 - Organização
18. Mover scripts .js para pasta `scripts/`
19. Mover arquivos .sql para `supabase/migrations/`
20. Mover documentação .md para `docs/`
21. Limpar arquivos temporários (.txt, templates duplicados)
22. Configurar redirects em `next.config.js` ao invés de páginas

### Prioridade 4 - Qualidade de Código
23. Substituir `console.log` por `logger`
24. Remover types `any` e criar interfaces
25. Padronizar imports do logger
26. Verificar cleanup de event listeners

---

## 📁 ARQUIVOS PARA DELETAR

```bash
# Páginas de teste/bypass (SEGURANÇA)
rm pages/admin/bypass.tsx
rm pages/admin/login-simple.tsx
rm pages/admin/test-auth.tsx
rm pages/admin/test-login.tsx
rm pages/test-analytics.tsx
rm pages/test-autoformat.tsx
rm pages/diag-noticias.tsx

# Páginas duplicadas
rm pages/admin/login-fixed.tsx
rm pages/admin/login-no-redirect.tsx
rm pages/admin/redirect-stable.tsx
rm pages/area-usuario.tsx

# Arquivos de backup
rm pages/admin/banners-original-backup.tsx
rm middleware-backup.ts

# Arquivos temporários
rm "Novo Documento de Texto.txt"
rm BD_Supa.txt
rm codigo-painel-banners.txt
```

---

## 🔧 CORREÇÕES DE CÓDIGO NECESSÁRIAS

### 1. pages/api/admin/media.ts - Adicionar Autenticação

```typescript
// ANTES
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

// DEPOIS
import { withAdminAuth, AdminApiHandler } from '../../../lib/api/withAdminAuth'

const handler: AdminApiHandler = async (req, res, { userId, adminClient }) => {
// ... resto do código usando adminClient ao invés de supabase
}

export default withAdminAuth(handler)
```

### 2. pages/admin/login.tsx - Remover SignOut Automático

```typescript
// REMOVER LINHAS 32-37:
// Limpar qualquer sessão existente ao carregar a página
// const clearSession = async () => {
//   await supabase.auth.signOut()
// }
// clearSession()
```

### 3. components/PageBanner.tsx - Mover useEffect

O useEffect na linha 128 está fora do retorno do componente. Precisa ser movido para dentro do corpo do componente, antes do return.

---

## ✅ CONCLUSÃO

O projeto está funcional mas tem problemas sérios de:
1. **Segurança:** Páginas e APIs expostas sem autenticação
2. **Organização:** Muitos arquivos duplicados e de teste
3. **Manutenção:** Código legado e backups no diretório principal

**Recomendação Principal:** Priorizar as ações de segurança (Prioridade 1) antes de fazer deploy para produção.

---

*Relatório gerado automaticamente em 10/12/2024*
