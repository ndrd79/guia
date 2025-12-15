# 🏗️ Arquitetura do Projeto - Template Portal

Este documento descreve a arquitetura recomendada para projetos criados com este template.

---

## 📐 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                      (Next.js + React)                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (SSR/SSG)  │  Components  │  Hooks  │  Context       │
├─────────────────────────────────────────────────────────────┤
│                          │                                   │
│                    API Routes                                │
│                   (Next.js API)                              │
│                          │                                   │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                               │
│                       (Supabase)                             │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Database (PostgreSQL)  │  Storage  │  Realtime    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas Recomendada

```
projeto/
├── pages/                    # Rotas do Next.js (SSR/SSG)
│   ├── _app.tsx             # App wrapper
│   ├── _document.tsx        # HTML base
│   ├── index.tsx            # Home
│   ├── noticias/            # Páginas de notícias
│   ├── guia/                # Guia comercial
│   ├── classificados/       # Classificados
│   ├── eventos/             # Eventos
│   ├── admin/               # Painel admin (protegido)
│   └── api/                 # API Routes
│       ├── admin/           # APIs protegidas
│       └── public/          # APIs públicas
│
├── components/              # Componentes React
│   ├── ui/                  # Componentes base (shadcn/ui)
│   ├── layout/              # Header, Footer, Nav
│   ├── cards/               # Cards de conteúdo
│   ├── forms/               # Formulários
│   └── admin/               # Componentes do admin
│
├── lib/                     # Utilitários e configurações
│   ├── supabase.ts         # Cliente Supabase
│   ├── utils.ts            # Funções utilitárias
│   └── validations/        # Schemas Zod
│
├── hooks/                   # Custom React Hooks
│   ├── useAuth.ts          # Hook de autenticação
│   ├── useBanners.ts       # Hook de banners
│   └── useToast.ts         # Hook de notificações
│
├── config/                  # Configurações
│   └── site.config.ts      # Configuração central
│
├── styles/                  # Estilos
│   └── globals.css         # CSS global + Tailwind
│
├── public/                  # Assets estáticos
│   ├── images/
│   └── favicon.svg
│
└── types/                   # TypeScript types
    └── index.ts
```

---

## 🔄 Fluxo de Dados

### Páginas Públicas (SSR/SSG)

```
┌────────────┐    ┌─────────────┐    ┌──────────────┐
│   Usuário  │───▶│  Next.js    │───▶│   Supabase   │
│  (Browser) │    │  (Server)   │    │  (Database)  │
└────────────┘    └─────────────┘    └──────────────┘
       │                │                    │
       │    GetServerSideProps /             │
       │    GetStaticProps                   │
       │                │                    │
       │◀───────────────┴────────────────────┘
       │         HTML + Dados
```

### Painel Admin (Client-Side)

```
┌────────────┐    ┌─────────────┐    ┌──────────────┐
│   Admin    │───▶│  API Route  │───▶│   Supabase   │
│  (Browser) │    │  (Next.js)  │    │  (Auth+RLS)  │
└────────────┘    └─────────────┘    └──────────────┘
       │                │                    │
       │         JWT Token                   │
       │    (Bearer Authorization)           │
       │                │                    │
       │◀───────────────┴────────────────────┘
       │         JSON Response
```

---

## 🔐 Camadas de Segurança

### 1. Autenticação (Supabase Auth)
```typescript
// lib/supabase.ts
const supabase = createClient(url, anonKey)

// Login
await supabase.auth.signInWithPassword({ email, password })

// Verificar sessão
const { data: { session } } = await supabase.auth.getSession()
```

### 2. Middleware (Next.js)
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Proteger rotas /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Verificar token de auth
  }
}
```

### 3. Row Level Security (Supabase)
```sql
-- Qualquer um pode ler notícias publicadas
CREATE POLICY "public_read" ON noticias
  FOR SELECT USING (workflow_status = 'published');

-- Apenas admins podem inserir/atualizar
CREATE POLICY "admin_write" ON noticias
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

---

## 🧩 Padrões de Código

### Componentes (React)

```typescript
// components/cards/NewsCard.tsx
interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
  featured?: boolean;
}

export default function NewsCard({ 
  id, 
  title, 
  excerpt, 
  imageUrl, 
  category,
  publishedAt,
  featured = false 
}: NewsCardProps) {
  return (
    <article className={`card ${featured ? 'card-featured' : ''}`}>
      {/* ... */}
    </article>
  )
}
```

### Hooks Customizados

```typescript
// hooks/useBanners.ts
export function useBanners(position: string, local: string) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchBanners()
  }, [position, local])
  
  return { banners, loading }
}
```

### API Routes

```typescript
// pages/api/admin/noticias.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Verificar autenticação
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  // 2. Processar request
  if (req.method === 'POST') {
    // Criar notícia
  }
  
  // 3. Retornar resposta
  return res.status(200).json({ success: true })
}
```

---

## 📊 Modelo de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │     │   noticias  │     │   empresas  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (FK)     │     │ id          │     │ id          │
│ email       │     │ titulo      │     │ name        │
│ role        │     │ descricao   │     │ description │
│ created_at  │     │ conteudo    │     │ category    │
└─────────────┘     │ imagem      │     │ rating      │
       │            │ categoria   │     │ location    │
       │            │ data        │     │ ativo       │
       │            │ destaque    │     │ featured    │
       ▼            │ status      │     │ plan_type   │
┌─────────────┐     └─────────────┘     └─────────────┘
│ auth.users  │
│ (Supabase)  │     ┌─────────────┐     ┌─────────────┐
└─────────────┘     │ classificados│    │   banners   │
                    ├─────────────┤     ├─────────────┤
                    │ id          │     │ id          │
                    │ titulo      │     │ nome        │
                    │ descricao   │     │ imagem      │
                    │ preco       │     │ link        │
                    │ categoria   │     │ posicao     │
                    │ localizacao │     │ local       │
                    └─────────────┘     │ ativo       │
                                        │ ordem       │
                    ┌─────────────┐     └─────────────┘
                    │   eventos   │
                    ├─────────────┤
                    │ id          │
                    │ titulo      │
                    │ data_inicio │
                    │ data_fim    │
                    │ local       │
                    └─────────────┘
```

---

## 🚀 Estratégias de Renderização

| Página | Estratégia | Motivo |
|--------|------------|--------|
| Home | SSR | Dados dinâmicos, SEO importante |
| Notícias (lista) | SSR | Conteúdo atualizado frequentemente |
| Notícia (detalhe) | ISR* | Cache 5min, revalidate on demand |
| Guia Comercial | SSR | Busca/filtros dinâmicos |
| Classificados | SSR | Dados mudam frequentemente |
| Eventos | SSR | Datas precisam estar atualizadas |
| Admin | CSR | Interatividade, não precisa SEO |

*ISR = Incremental Static Regeneration

---

## 💡 Boas Práticas

### Performance
- ✅ Usar `next/image` para imagens otimizadas
- ✅ Lazy loading para componentes pesados
- ✅ Prefetch de links críticos
- ✅ Cache de dados com SWR ou React Query

### SEO
- ✅ Meta tags em todas as páginas
- ✅ Sitemap dinâmico
- ✅ Dados estruturados (JSON-LD)
- ✅ URLs amigáveis

### Segurança
- ✅ Variáveis de ambiente para secrets
- ✅ Validação de inputs (Zod)
- ✅ RLS no Supabase
- ✅ Rate limiting nas APIs
