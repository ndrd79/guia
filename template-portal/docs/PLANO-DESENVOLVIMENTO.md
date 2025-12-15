# 📋 Plano de Desenvolvimento - Template Portal

Este documento serve como guia passo a passo para criar um novo portal usando o template.

---

## 🎯 Fases do Projeto

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: Setup Inicial              │  ⏱️ 1-2 horas        │
├─────────────────────────────────────────────────────────────┤
│  FASE 2: Configuração do Cliente    │  ⏱️ 30 min           │
├─────────────────────────────────────────────────────────────┤
│  FASE 3: Banco de Dados             │  ⏱️ 1 hora           │
├─────────────────────────────────────────────────────────────┤
│  FASE 4: Componentes Base           │  ⏱️ 2-3 horas        │
├─────────────────────────────────────────────────────────────┤
│  FASE 5: Páginas Públicas           │  ⏱️ 4-6 horas        │
├─────────────────────────────────────────────────────────────┤
│  FASE 6: Dashboard Admin            │  ⏱️ 6-8 horas        │
├─────────────────────────────────────────────────────────────┤
│  FASE 7: Testes e Ajustes           │  ⏱️ 2-3 horas        │
├─────────────────────────────────────────────────────────────┤
│  FASE 8: Deploy                     │  ⏱️ 1 hora           │
└─────────────────────────────────────────────────────────────┘
                                      Total: 18-25 horas
```

---

## 📝 Fase 1: Setup Inicial

### Checklist
- [ ] Criar projeto Next.js
- [ ] Instalar dependências
- [ ] Configurar Tailwind CSS
- [ ] Configurar TypeScript
- [ ] Copiar arquivos do template

### Comandos
```bash
# 1. Criar projeto
npx create-next-app@latest portal-cliente --typescript --tailwind --eslint --app=false --src-dir=false

# 2. Entrar na pasta
cd portal-cliente

# 3. Instalar dependências adicionais
npm install @supabase/supabase-js lucide-react react-hook-form zod @hookform/resolvers date-fns

# 4. Instalar shadcn/ui (para dashboard)
npx shadcn@latest init

# 5. Instalar componentes shadcn
npx shadcn@latest add button input label card table dialog dropdown-menu tabs
```

### Arquivos para copiar do template
```
template/config/site.config.ts     → config/site.config.ts
template/design-system/globals.css → styles/globals.css
template/design-system/tailwind.config.js → tailwind.config.js (merge)
template/components/*              → components/layout/
```

---

## 📝 Fase 2: Configuração do Cliente

### Checklist
- [ ] Editar `config/site.config.ts`
- [ ] Adicionar logo do cliente
- [ ] Configurar cores (se diferentes)
- [ ] Atualizar meta tags

### Arquivo: config/site.config.ts
```typescript
export const siteConfig = {
  name: "Portal [NOME DA CIDADE]",
  description: "Guia comercial de [CIDADE]",
  contact: {
    phone: "(XX) XXXXX-XXXX",
    email: "contato@[cliente].com.br",
    // ...
  }
}
```

---

## 📝 Fase 3: Banco de Dados

### Checklist
- [ ] Criar projeto no Supabase
- [ ] Executar SQL das tabelas
- [ ] Configurar Storage
- [ ] Criar usuário admin
- [ ] Configurar RLS policies
- [ ] Adicionar variáveis de ambiente

### Tabelas a criar
1. `profiles` - Perfis de usuário
2. `noticias` - Notícias
3. `empresas` - Empresas do guia
4. `classificados` - Anúncios classificados
5. `eventos` - Eventos da cidade
6. `banners` - Banners publicitários

### Arquivo: .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## 📝 Fase 4: Componentes Base

### Checklist
- [ ] Header.tsx (com news ticker)
- [ ] Footer.tsx (com newsletter)
- [ ] Nav.tsx (navegação responsiva)
- [ ] Layout.tsx (wrapper padrão)
- [ ] NewsCard.tsx
- [ ] BusinessCard.tsx
- [ ] EventCard.tsx
- [ ] BannerCarousel.tsx

### Estrutura de componentes
```
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Nav.tsx
│   └── Layout.tsx
├── cards/
│   ├── NewsCard.tsx
│   ├── BusinessCard.tsx
│   └── EventCard.tsx
├── banners/
│   ├── BannerCarousel.tsx
│   └── BannerSlot.tsx
└── ui/
    └── (componentes shadcn)
```

---

## 📝 Fase 5: Páginas Públicas

### Checklist
- [ ] Home (index.tsx)
- [ ] Notícias (/noticias)
- [ ] Notícia individual (/noticias/[slug])
- [ ] Guia Comercial (/guia)
- [ ] Empresa individual (/guia/[id])
- [ ] Classificados (/classificados)
- [ ] Eventos (/eventos)
- [ ] Contato (/contato)
- [ ] Sobre (/sobre)
- [ ] Termos (/termos)
- [ ] Privacidade (/privacidade)

### Prioridade de desenvolvimento
```
1. _app.tsx, _document.tsx (estrutura)
2. index.tsx (home)
3. noticias/index.tsx (lista)
4. noticias/[id].tsx (detalhe)
5. guia/index.tsx (lista)
6. classificados/index.tsx
7. eventos/index.tsx
8. contato/index.tsx
9. Páginas institucionais
```

---

## 📝 Fase 6: Dashboard Admin

### Checklist
- [ ] Layout do admin (sidebar + header)
- [ ] Página de login
- [ ] Dashboard (métricas)
- [ ] CRUD Notícias
- [ ] CRUD Empresas
- [ ] CRUD Classificados
- [ ] CRUD Eventos
- [ ] Gerenciamento de Banners
- [ ] Gerenciamento de Usuários

### Estrutura do admin
```
pages/admin/
├── login.tsx
├── index.tsx (dashboard)
├── noticias.tsx
├── empresas.tsx
├── classificados.tsx
├── eventos.tsx
├── banners.tsx
└── usuarios.tsx
```

### Componentes shadcn para usar
- `DataTable` - Listagem de dados
- `Dialog` - Modais de formulário
- `Form` - Formulários com validação
- `DropdownMenu` - Ações em linha
- `Tabs` - Organização de conteúdo
- `Card` - Métricas do dashboard

---

## 📝 Fase 7: Testes e Ajustes

### Checklist
- [ ] Testar todas as páginas
- [ ] Testar CRUD no admin
- [ ] Testar responsividade (mobile)
- [ ] Testar upload de imagens
- [ ] Testar autenticação
- [ ] Verificar SEO (meta tags)
- [ ] Verificar performance (Lighthouse)
- [ ] Corrigir bugs encontrados

### Testes mínimos
```
✅ Criar notícia no admin → aparece no site
✅ Criar empresa → aparece no guia
✅ Upload de banner → exibe corretamente
✅ Login/logout funcionando
✅ Site responsivo em mobile
```

---

## 📝 Fase 8: Deploy

### Checklist
- [ ] Push para GitHub
- [ ] Conectar ao Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Verificar domínio
- [ ] Testar em produção
- [ ] Entregar para o cliente

### Configuração Vercel
```
Framework Preset: Next.js
Build Command: next build
Output Directory: .next
Install Command: npm install
```

### Variáveis de ambiente no Vercel
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## 🔄 Template de Acompanhamento

Use este template para acompanhar o progresso:

```markdown
## Projeto: Portal [CLIENTE]
**Início:** DD/MM/AAAA
**Previsão:** DD/MM/AAAA

### Fase 1: Setup ⏳
- [x] Criar projeto
- [x] Instalar dependências
- [ ] Configurar Tailwind

### Fase 2: Configuração ⏳
- [ ] site.config.ts
- [ ] Logo

### Fase 3: Banco ⏳
- [ ] Supabase criado
- [ ] Tabelas criadas

... (continuar para todas as fases)
```

---

## 📞 Informações do Cliente

Preencha antes de começar:

| Campo | Valor |
|-------|-------|
| Nome do Portal | |
| Cidade/Região | |
| Telefone | |
| Email | |
| Redes Sociais | |
| Cores preferidas | |
| Logo (arquivo) | |
| Domínio | |
