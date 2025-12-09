# Sistema de Banners - Fase 2 Implementada

## ✅ Status: COMPONENTES CRIADOS

A Fase 2 do plano de arquitetura de banners foi **parcialmente implementada**. Os seguintes componentes foram criados:

### Componentes Implementados

#### 1. BannerTemplateRegistry (`lib/banners/BannerTemplateRegistry.ts`)
- Factory Pattern para gerenciar templates dinamicamente
- Métodos: `register()`, `get()`, `getAll()`, `has()`, `unregister()`, `clear()`
- Suporta adição de novos templates sem modificar código existente

#### 2. Templates de Banner

**CarouselTemplate** (`components/banners/templates/CarouselTemplate.tsx`)
- Carrossel automático com rotação configurável
- Navegação com setas e indicadores
- Suporte a transições slide/fade
- Pause no hover
- Tracking de visualizações

**StaticTemplate** (`components/banners/templates/StaticTemplate.tsx`)  
- Banner estático único
- Suporte a sticky positioning
- Lazy loading opcional
- Borda opcional

**GridTemplate** (`components/banners/templates/GridTemplate.tsx`)
- Layout em grid responsivo
- Colunas configuráveis (ajusta automaticamente no mobile)
- Gap configurável
- Aspect ratio personalizável

#### 3. BannerSlot (`components/banners/BannerSlot.tsx`)
- Componente universal que carrega banners por posição
- Integração com Supabase
- Modo debug para desenvolvimento
- Loading skeleton
- Fallback para erros

## 📝 Como Usar

### Uso Básico

```tsx
import { BannerSlot } from '@/components/banners'

// Em qualquer página
<BannerSlot position="hero-carousel" />
<BannerSlot position="sidebar-top-right" className="mt-4" />
<BannerSlot position="footer-banner" />
```

### Com Debug

```tsx
<BannerSlot 
  position="hero-carousel" 
  debug={process.env.NODE_ENV === 'development'}
/>
```

### Com Callbacks de Analytics

```tsx
<BannerSlot 
  position="hero-carousel"
  onBannerView={(banner) => {
    // Registrar visualização
    console.log('Banner visualizado:', banner.id)
  }}
  onBannerClick={(banner) => {
    // Registrar clique
    console.log('Banner clicado:', banner.id, banner.link)
  }}
/>
```

### Adicionando Novo Template Personalizado

```tsx
import { BannerTemplateRegistry, BannerTemplateProps } from '@/components/banners'

// Criar seu template
const MyCustomTemplate: React.FC<BannerTemplateProps> = ({
  banners,
  config,
  responsive,
  onBannerClick,
  onBannerView
}) => {
  // Sua implementação aqui
  return <div>...</div>
}

// Registrar
BannerTemplateRegistry.register('custom', MyCustomTemplate)

// Usar (precisa criar template no banco também)
<BannerSlot position="my-custom-position" />
```

## 🚧 Próximos Passos (Fase 2 - Pendente)

### 1. Migração de Dados
Criar script para migrar banners existentes da tabela `banners` para o novo sistema:

```typescript
// scripts/migrate-banner-positions.ts
// 1. Para cada posição existente, criar banner_position
// 2. Para cada banner ativo, criar banner_instance
// 3. Vincular banners ao banner_instance
```

### 2. API Endpoints
Criar endpoints para gerenciar o novo sistema:

- `POST /api/v2/banner-positions` - Criar nova posição
- `GET /api/v2/banner-positions` - Listar posições
- `POST /api/v2/banner-instances` - Criar instância de banner
- `PUT /api/v2/banner-instances/:id` - Atualizar instância
- `DELETE /api/v2/banner-instances/:id` - Remover instância

### 3. Painel Admin  
Adaptar painel admin existente para usar novo sistema:

- Adicionar aba "Novo Sistema" no admin/banners
- Interface para gerenciar positions
- Interface para gerenciar instances
- Preview visual das posições

### 4. Migração Gradual das Páginas
Substituir componentes antigos por BannerSlot:

**Páginas Prioritárias:**
- [ ] `pages/index.tsx` - Hero Carousel
- [ ] `pages/noticias/index.tsx` - Sidebars
- [ ] `pages/eventos/index.tsx` - Footer banners
-  [ ] `components/Header.tsx` - Header banners
- [ ] `components/Footer.tsx` - Footer banner

## 🎯 Benefícios Já Disponíveis

1. **Templates Reutilizáveis**: Não precisa duplicar código para cada posição
2. **Configuração Centralizada**: Tudo no banco de dados
3. **Responsivo por Padrão**: Regras responsivas no template
4. **Extensível**: Adicione novos templates sem modificar código existente
5. **Type-Safe**: TypeScript em todos os componentes

## 📊 Estrutura do Banco (Já Criada)

As seguintes tabelas já existem no Supabase:

- ✅ `banner_templates` - 10 templates pré-configurados
- ✅ `banner_positions` - 17 posições pré-criadas
- ✅ `banner_slots` - Definições de slots
- ✅ `banner_instances` - Instâncias ativas de banners

## 🔧 Configurar para Usar

### 1. Verificar Tabelas no Supabase

```sql
-- Verificar templates disponíveis
SELECT name, component_type FROM banner_templates;

-- Verificar posições criadas
SELECT name, slug FROM banner_positions;
```

### 2. Criar Primeira Instância (Exemplo)

```sql
-- Criar instância de banner para hero carousel
INSERT INTO banner_instances (
  position_id,
  template_id,
  banners,
  config,
  start_date,
  end_date,
  is_active
)
SELECT 
  bp.id,
  bt.id,
  '[{"id": "banner-uuid", "imagem": "url", "link": "https://..."}]'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW() + INTERVAL '30 days',
  true
FROM banner_positions bp
CROSS JOIN banner_templates bt
WHERE bp.slug = 'hero-carousel'
  AND bt.component_type = 'carousel'
LIMIT 1;
```

### 3. Usar no Código

```tsx
import { BannerSlot } from '@/components/banners'

export default function Home() {
  return (
    <div>
      <BannerSlot position="hero-carousel" />
      {/* Resto da página */}
    </div>
  )
}
```

## 📚 Referências

- Documento de Arquitetura: `ARQUITETURA-OTIMIZACAO-BANNERS.md`
- Migrações SQL: `supabase/migrations/20241201_create_banner_*.sql`
- Código Antigo (para referência): `components/BannerContainer.tsx`
