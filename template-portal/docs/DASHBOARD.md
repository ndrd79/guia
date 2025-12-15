# 🎛️ Dashboard Admin - Guia de Implementação

Este documento explica como criar o dashboard admin usando **shadcn/ui**.

---

## 📦 Biblioteca Escolhida: shadcn/ui

### Por que shadcn/ui?

| Critério | Vantagem |
|----------|----------|
| **Compatibilidade** | Usa Tailwind CSS (já instalado) |
| **Ícones** | Usa lucide-react (já instalado) |
| **Formulários** | Integra com react-hook-form + zod (já usa) |
| **Peso** | Leve - só instala o que precisa |
| **Customização** | 100% customizável (você copia os componentes) |

### Links Úteis
- Documentação: https://ui.shadcn.com
- Componentes: https://ui.shadcn.com/docs/components

---

## 🚀 Instalação

### 1. Inicializar shadcn/ui
```bash
npx shadcn@latest init
```

Responda as perguntas:
- Style: **Default**
- Base color: **Slate** (ou sua preferência)
- CSS variables: **Yes**

### 2. Instalar Componentes Essenciais
```bash
# Componentes de UI básicos
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add badge

# Formulários
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add switch

# Tabelas e dados
npx shadcn@latest add table
npx shadcn@latest add data-table

# Navegação e modais
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add sheet

# Feedback
npx shadcn@latest add toast
npx shadcn@latest add alert
npx shadcn@latest add skeleton
```

---

## 📁 Estrutura do Dashboard

```
pages/admin/
├── login.tsx              # Tela de login
├── index.tsx              # Dashboard principal
├── noticias.tsx           # CRUD de notícias
├── empresas.tsx           # CRUD de empresas
├── classificados.tsx      # CRUD de classificados
├── eventos.tsx            # CRUD de eventos
├── banners.tsx            # Gerenciamento de banners
└── usuarios.tsx           # Gerenciamento de usuários

components/admin/
├── AdminLayout.tsx        # Layout com sidebar
├── Sidebar.tsx            # Menu lateral
├── Header.tsx             # Cabeçalho do admin
├── StatsCard.tsx          # Card de estatísticas
├── DataTable.tsx          # Tabela de dados reutilizável
└── forms/
    ├── NoticiaForm.tsx
    ├── EmpresaForm.tsx
    └── BannerForm.tsx
```

---

## 🎨 Layout do Dashboard

### Estrutura Visual

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌─────────────────────────────────────────┐ │
│ │         │ │  HEADER                                 │ │
│ │         │ │  [Breadcrumb]        [User] [Logout]    │ │
│ │ SIDEBAR │ ├─────────────────────────────────────────┤ │
│ │         │ │                                         │ │
│ │ [Logo]  │ │  CONTEÚDO PRINCIPAL                     │ │
│ │         │ │                                         │ │
│ │ [Menu]  │ │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │ │
│ │ - Home  │ │  │Stats│ │Stats│ │Stats│ │Stats│       │ │
│ │ - News  │ │  └─────┘ └─────┘ └─────┘ └─────┘       │ │
│ │ - Guia  │ │                                         │ │
│ │ - Ads   │ │  ┌─────────────────────────────────┐   │ │
│ │ - Events│ │  │                                 │   │ │
│ │ - Banner│ │  │     TABELA / FORMULÁRIO         │   │ │
│ │         │ │  │                                 │   │ │
│ │ [Sair]  │ │  └─────────────────────────────────┘   │ │
│ └─────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Código Base

### AdminLayout.tsx

```tsx
import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './Header'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={title} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Sidebar.tsx

```tsx
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  LayoutDashboard, 
  Newspaper, 
  Building2, 
  ShoppingBag,
  Calendar,
  Image,
  Users,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/noticias', icon: Newspaper, label: 'Notícias' },
  { href: '/admin/empresas', icon: Building2, label: 'Empresas' },
  { href: '/admin/classificados', icon: ShoppingBag, label: 'Classificados' },
  { href: '/admin/eventos', icon: Calendar, label: 'Eventos' },
  { href: '/admin/banners', icon: Image, label: 'Banners' },
  { href: '/admin/usuarios', icon: Users, label: 'Usuários' },
]

export function Sidebar() {
  const router = useRouter()
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Admin</h1>
      </div>
      
      {/* Menu */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = router.pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full">
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
```

### StatsCard.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 📊 Página Dashboard (index.tsx)

```tsx
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StatsCard } from '@/components/admin/StatsCard'
import { Newspaper, Building2, ShoppingBag, Calendar } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Notícias"
          value={42}
          icon={Newspaper}
          description="Total publicadas"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Empresas"
          value={156}
          icon={Building2}
          description="Cadastradas no guia"
        />
        <StatsCard
          title="Classificados"
          value={89}
          icon={ShoppingBag}
          description="Anúncios ativos"
        />
        <StatsCard
          title="Eventos"
          value={7}
          icon={Calendar}
          description="Próximos eventos"
        />
      </div>
      
      {/* Mais conteúdo aqui */}
    </AdminLayout>
  )
}
```

---

## 📝 CRUD com DataTable

### Exemplo: Lista de Notícias

```tsx
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Plus } from 'lucide-react'

const columns = [
  { accessorKey: 'titulo', header: 'Título' },
  { accessorKey: 'categoria', header: 'Categoria' },
  { accessorKey: 'data', header: 'Data' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: 'Ações' },
]

export default function NoticiasAdmin() {
  return (
    <AdminLayout title="Notícias">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Notícias</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Notícia
        </Button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={noticias} 
      />
    </AdminLayout>
  )
}
```

---

## ✅ Checklist de Implementação

### Componentes Base
- [ ] AdminLayout.tsx
- [ ] Sidebar.tsx
- [ ] Header.tsx (admin)
- [ ] StatsCard.tsx

### Páginas Admin
- [ ] login.tsx
- [ ] index.tsx (dashboard)
- [ ] noticias.tsx
- [ ] empresas.tsx
- [ ] classificados.tsx
- [ ] eventos.tsx
- [ ] banners.tsx

### Formulários
- [ ] NoticiaForm.tsx
- [ ] EmpresaForm.tsx
- [ ] BannerForm.tsx

### Funcionalidades
- [ ] Autenticação (login/logout)
- [ ] Proteção de rotas
- [ ] CRUD completo
- [ ] Upload de imagens
- [ ] Validação de formulários
