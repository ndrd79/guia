# Guia Completo de Implementação do Sistema de Banners

## 1. Arquitetura e Componentes Necessários

### **Estrutura do Sistema**
```
sistema-banners/
├── backend/
│   ├── database/          # Schema e migrations
│   ├── api/               # Endpoints da API
│   └── storage/           # Configuração de storage
├── frontend/
│   ├── components/        # Componentes React
│   ├── hooks/            # Hooks customizados
│   ├── lib/              # Utilidades e configurações
│   └── pages/            # Páginas do admin
└── admin/                 # Painel administrativo
```

### **Tecnologias Requeridas**
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Frontend**: React 18+ com Next.js
- **Estado**: Hooks do React (useState, useEffect)
- **Cache**: Mapa em memória (5 minutos)
- **Analytics**: Sistema de tracking integrado

## 2. Configuração do Banco de Dados

### **2.1 Schema SQL da Tabela Banners**
```sql
-- Criar tabela de banners
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    posicao VARCHAR(50) NOT NULL,
    imagem TEXT NOT NULL,
    link TEXT,
    largura INTEGER NOT NULL DEFAULT 400,
    altura INTEGER NOT NULL DEFAULT 200,
    ativo BOOLEAN DEFAULT true,
    duracao_segundos INTEGER DEFAULT 5,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    cliques INTEGER DEFAULT 0,
    impressoes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_banners_posicao ON banners(posicao);
CREATE INDEX idx_banners_ativo ON banners(ativo);
CREATE INDEX idx_banners_periodo ON banners(data_inicio, data_fim);

-- Permissões básicas
GRANT SELECT ON banners TO anon;
GRANT ALL ON banners TO authenticated;
```

### **2.2 RLS (Row Level Security)**
```sql
-- Ativar RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Política para usuários anônimos (apenas banners ativos)
CREATE POLICY "Anônimos podem ver banners ativos" ON banners
    FOR SELECT
    TO anon
    USING (ativo = true);

-- Política para usuários autenticados (todos os banners)
CREATE POLICY "Usuários autenticados podem ver todos banners" ON banners
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para admin (CRUD completo)
CREATE POLICY "Admin pode gerenciar banners" ON banners
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
```

## 3. Backend/API

### **3.1 Configuração Supabase**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface Banner {
  id: string
  nome: string
  posicao: string
  imagem: string
  link?: string
  largura: number
  altura: number
  ativo: boolean
  duracao_segundos: number
  data_inicio?: string
  data_fim?: string
  cliques: number
  impressoes: number
  created_at: string
  updated_at: string
}
```

### **3.2 API Endpoints**
```typescript
// pages/api/banners.ts
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { posicao } = req.query
    
    let query = supabaseAdmin
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })

    if (posicao) {
      query = query.eq('posicao', posicao)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const banner = req.body
    
    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert(banner)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data)
  }

  // Implementar PUT e DELETE...
}
```

### **3.3 Analytics API**
```typescript
// pages/api/analytics/track.ts
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { bannerId, action, position } = req.body

    if (action === 'click') {
      await supabaseAdmin
        .from('banners')
        .update({ cliques: supabaseAdmin.raw('cliques + 1') })
        .eq('id', bannerId)
    }

    if (action === 'view') {
      await supabaseAdmin
        .from('banners')
        .update({ impressoes: supabaseAdmin.raw('impressoes + 1') })
        .eq('id', bannerId)
    }

    // Registrar evento de analytics
    await supabaseAdmin.from('analytics_events').insert({
      event_type: `banner_${action}`,
      event_data: { bannerId, position },
      timestamp: new Date().toISOString()
    })

    return res.status(200).json({ success: true })
  }
}
```

## 4. Frontend/React Components

### **4.1 Componente Banner Principal**
```tsx
// components/BannerAd.tsx
import React, { useState } from 'react'
import Image from 'next/image'
import { useAnalytics } from '../hooks/useAnalytics'

interface BannerAdProps {
  position: string
  className?: string
  width?: number
  height?: number
  imageUrl?: string
  linkUrl?: string
  altText?: string
  title?: string
  bannerId?: string
}

const BannerAd: React.FC<BannerAdProps> = ({
  position,
  className = '',
  width,
  height,
  imageUrl,
  linkUrl,
  altText = 'Banner Publicitário',
  title,
  bannerId
}) => {
  const { trackBannerClick } = useAnalytics()
  const [imageError, setImageError] = useState(false)

  const handleClick = () => {
    if (bannerId && linkUrl) {
      trackBannerClick(bannerId, position, linkUrl)
    }
  }

  // Placeholder quando não há imagem
  if (!imageUrl || imageError) {
    return (
      <div className="border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg mx-auto" style={{ width, height }}>
        <div className="text-center">
          <i className="fas fa-bullhorn text-2xl mb-2"></i>
          <p className="text-xs">Espaço Publicitário</p>
        </div>
      </div>
    )
  }

  const adContent = (
    <div className={`relative overflow-hidden rounded-lg mx-auto ${className}`}>
      <div className="relative w-full" style={{ aspectRatio: `${width || 400}/${height || 200}` }}>
        <Image
          src={imageUrl}
          alt={altText}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 50vw"
          priority={position === 'hero'}
          onError={() => setImageError(true)}
        />
      </div>
    </div>
  )

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {adContent}
      </a>
    )
  }

  return adContent
}

export default BannerAd
```

### **4.2 Componente Hero Banner (Carrossel)**
```tsx
// components/HeroBanner.tsx
import React, { useState, useEffect } from 'react'
import { useMultipleBanners } from '../hooks/useBanners'
import BannerAd from './BannerAd'

interface HeroBannerProps {
  banners?: Banner[]
  className?: string
  idealWidth?: number
  idealHeight?: number
}

const HeroBanner: React.FC<HeroBannerProps> = ({ 
  banners: propBanners, 
  className = '', 
  idealWidth = 585, 
  idealHeight = 330 
}) => {
  const { banners: hookBanners } = useMultipleBanners('Hero Carousel', 5)
  const banners = propBanners || hookBanners
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, (banners[currentIndex]?.duracao_segundos || 5) * 1000)

    return () => clearInterval(interval)
  }, [banners.length, currentIndex])

  if (banners.length === 0) {
    return (
      <BannerAd
        position="hero"
        className={className}
        width={idealWidth}
        height={idealHeight}
      />
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ position: index === currentIndex ? 'relative' : 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <BannerAd
            position="hero"
            imageUrl={banner.imagem}
            linkUrl={banner.link}
            title={banner.nome}
            bannerId={banner.id}
            width={idealWidth}
            height={idealHeight}
            altText={banner.nome}
          />
        </div>
      ))}
      
      {/* Indicadores */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HeroBanner
```

## 5. Hooks e Utilidades

### **5.1 Hook Principal de Banners**
```typescript
// hooks/useBanners.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, Banner } from '../lib/supabase'

// Cache simples para banners
const bannerCache = new Map<string, { data: Banner[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useBanners(posicao?: string) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBanners = useCallback(async () => {
    const cacheKey = posicao || 'all'
    const cached = bannerCache.get(cacheKey)
    
    // Verificar cache
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setBanners(cached.data)
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('banners')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      if (posicao) {
        query = query.eq('posicao', posicao)
      }

      const { data, error } = await query

      if (error) throw error

      const bannersData = data || []
      setBanners(bannersData)
      
      // Atualizar cache
      bannerCache.set(cacheKey, {
        data: bannersData,
        timestamp: Date.now()
      })
    } catch (err) {
      console.error('Erro ao carregar banners:', err)
      setError('Erro ao carregar banners')
    } finally {
      setLoading(false)
    }
  }, [posicao])

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  return { banners, loading, error }
}

// Hook para obter um banner específico por posição
export function useBanner(posicao: string) {
  const { banners, loading, error } = useBanners(posicao)
  
  const banner = banners.length > 0 ? banners[0] : null
  
  return { banner, loading, error }
}

// Hook para obter múltiplos banners de uma posição
export function useMultipleBanners(posicao: string, limit?: number) {
  const { banners, loading, error } = useBanners(posicao)
  
  const limitedBanners = limit ? banners.slice(0, limit) : banners
  
  return { banners: limitedBanners, loading, error }
}
```

### **5.2 Hook de Analytics**
```typescript
// hooks/useAnalytics.ts
import { useCallback } from 'react'

export function useAnalytics() {
  const trackBannerClick = useCallback(async (bannerId: string, position: string, linkUrl: string) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerId,
          action: 'click',
          position
        })
      })
    } catch (error) {
      console.error('Erro ao rastrear clique:', error)
    }
  }, [])

  const trackBannerView = useCallback(async (bannerId: string, position: string) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerId,
          action: 'view',
          position
        })
      })
    } catch (error) {
      console.error('Erro ao rastrear visualização:', error)
    }
  }, [])

  return { trackBannerClick, trackBannerView }
}
```

## 6. Admin Panel

### **6.1 Formulário de Cadastro**
```tsx
// components/admin/BannerForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const bannerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  posicao: z.string().min(1, 'Posição é obrigatória'),
  imagem: z.string().min(1, 'Imagem é obrigatória').url(),
  link: z.string().url('URL inválida').optional().or(z.literal('')),
  largura: z.number().min(50).max(2000),
  altura: z.number().min(50).max(1000),
  ativo: z.boolean(),
  duracao_segundos: z.number().min(3).max(10),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional()
})

type BannerFormData = z.infer<typeof bannerSchema>

const posicoesBanner = [
  { nome: 'Hero Carousel', tamanho: '585x330', descricao: 'Carrossel principal' },
  { nome: 'Hero Top', tamanho: '1170x330', descricao: 'Topo da página' },
  { nome: 'Sidebar Direita', tamanho: '300x600', descricao: 'Sidebar lateral' }
]

export function BannerForm({ onSubmit, initialData }: { onSubmit: (data: BannerFormData) => void, initialData?: Partial<BannerFormData> }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: initialData || {}
  })

  const posicaoSelecionada = watch('posicao')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome do Banner</label>
        <input {...register('nome')} className="w-full border rounded px-3 py-2" />
        {errors.nome && <span className="text-red-500 text-sm">{errors.nome.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Posição</label>
        <select {...register('posicao')} className="w-full border rounded px-3 py-2">
          <option value="">Selecione uma posição</option>
          {posicoesBanner.map(pos => (
            <option key={pos.nome} value={pos.nome}>
              {pos.nome} - {pos.descricao} ({pos.tamanho})
            </option>
          ))}
        </select>
        {errors.posicao && <span className="text-red-500 text-sm">{errors.posicao.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Imagem (URL)</label>
        <input {...register('imagem')} className="w-full border rounded px-3 py-2" />
        {errors.imagem && <span className="text-red-500 text-sm">{errors.imagem.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Largura (px)</label>
          <input type="number" {...register('largura', { valueAsNumber: true })} className="w-full border rounded px-3 py-2" />
          {errors.largura && <span className="text-red-500 text-sm">{errors.largura.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Altura (px)</label>
          <input type="number" {...register('altura', { valueAsNumber: true })} className="w-full border rounded px-3 py-2" />
          {errors.altura && <span className="text-red-500 text-sm">{errors.altura.message}</span>}
        </div>
      </div>

      <div className="flex items-center">
        <input type="checkbox" {...register('ativo')} className="mr-2" />
        <label className="text-sm font-medium">Banner Ativo</label>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Salvar Banner
      </button>
    </form>
  )
}
```

## 7. Analytics e Tracking

### **7.1 Dashboard de Analytics**
```tsx
// components/admin/AnalyticsDashboard.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    totalClicks: 0,
    totalViews: 0
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    const { data: banners } = await supabase
      .from('banners')
      .select('ativo, cliques, impressoes')

    if (banners) {
      setStats({
        totalBanners: banners.length,
        activeBanners: banners.filter(b => b.ativo).length,
        totalClicks: banners.reduce((sum, b) => sum + b.cliques, 0),
        totalViews: banners.reduce((sum, b) => sum + b.impressoes, 0)
      })
    }
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total de Banners</h3>
        <p className="text-2xl font-bold">{stats.totalBanners}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Banners Ativos</h3>
        <p className="text-2xl font-bold text-green-600">{stats.activeBanners}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total de Cliques</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.totalClicks}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total de Visualizações</h3>
        <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
      </div>
    </div>
  )
}
```

## 8. Configurações de Segurança

### **8.1 Validação de URLs**
```typescript
// utils/security.ts
export function isSecureUrl(url: string): boolean {
  if (!url) return true
  
  try {
    const parsedUrl = new URL(url)
    
    // Permitir apenas protocolos seguros
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Bloquear IPs locais e privados
    const hostname = parsedUrl.hostname.toLowerCase()
    const blockedPatterns = [
      /^localhost$/,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^0\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ]
    
    return !blockedPatterns.some(pattern => pattern.test(hostname))
  } catch {
    return false
  }
}
```

### **8.2 Validação de Imagens**
```typescript
// utils/validation.ts
export function validateBannerImage(url: string): boolean {
  // Verificar se é URL do Supabase
  if (!url.includes('supabase.co') && !url.includes('supabase.in')) {
    return false
  }
  
  // Verificar extensões permitidas
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = allowedExtensions.some(ext => 
    url.toLowerCase().endsWith(ext)
  )
  
  return hasValidExtension
}
```

## 9. Deploy e Testes

### **9.1 Variáveis de Ambiente**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
```

### **9.2 Testes de Funcionalidade**
```typescript
// tests/banners.test.ts
describe('Sistema de Banners', () => {
  test('Deve carregar banners ativos', async () => {
    const { banners } = await loadBanners('Hero Carousel')
    expect(banners).toBeDefined()
    expect(banners.every(b => b.ativo)).toBe(true)
  })

  test('Deve validar URLs seguras', () => {
    expect(isSecureUrl('https://example.com')).toBe(true)
    expect(isSecureUrl('http://localhost')).toBe(false)
    expect(isSecureUrl('javascript:alert()')).toBe(false)
  })

  test('Deve rastrear cliques', async () => {
    const trackClick = jest.fn()
    await trackBannerClick('banner-123', 'Hero Carousel', 'https://example.com')
    expect(trackClick).toHaveBeenCalledWith('banner-123', 'Hero Carousel', 'https://example.com')
  })
})
```

### **9.3 Script de Teste**
```javascript
// scripts/test-banners.js
const testBannerSystem = async () => {
  console.log('🧪 Testando Sistema de Banners...')
  
  // Testar criação de banner
  const newBanner = {
    nome: 'Banner Teste',
    posicao: 'Hero Carousel',
    imagem: 'https://example.com/image.jpg',
    link: 'https://example.com',
    largura: 585,
    altura: 330,
    ativo: true,
    duracao_segundos: 5
  }
  
  try {
    const response = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBanner)
    })
    
    if (response.ok) {
      console.log('✅ Banner criado com sucesso')
    } else {
      console.error('❌ Erro ao criar banner')
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testBannerSystem()
```

## 10. Checklist de Implementação

### **10.1 Configuração Inicial**
- [ ] Criar projeto no Supabase
- [ ] Configurar tabela de banners
- [ ] Ativar RLS e criar políticas
- [ ] Configurar storage para imagens
- [ ] Criar usuário admin

### **10.2 Backend**
- [ ] Implementar API de banners
- [ ] Criar endpoints de analytics
- [ ] Configurar validações de segurança
- [ ] Implementar cache

### **10.3 Frontend**
- [ ] Criar componentes de banner
- [ ] Implementar hooks de banners
- [ ] Criar sistema de carrossel
- [ ] Implementar analytics

### **10.4 Admin Panel**
- [ ] Criar formulário de cadastro
- [ ] Implementar listagem de banners
- [ ] Criar dashboard de analytics
- [ ] Adicionar validações

### **10.5 Testes e Deploy**
- [ ] Testar todas as funcionalidades
- [ ] Verificar segurança
- [ ] Testar performance
- [ ] Fazer deploy
- [ ] Monitorar logs

## 11. Manutenção e Otimização

### **11.1 Performance**
- Cache de 5 minutos para reduzir chamadas ao banco
- Lazy loading de imagens
- Otimização de queries com índices
- Compressão de imagens no upload

### **11.2 Monitoramento**
- Logs de erro no console
- Analytics de cliques e visualizações
- Monitoramento de performance
- Alertas de banners expirados

### **11.3 Escalabilidade**
- Paginação para muitos banners
- Filtros avançados no admin
- Exportação de relatórios
- API rate limiting

---

**Notas Finais:**
- Este sistema é totalmente compatível com Next.js e React
- Utiliza Supabase para backend simplificado
- Inclui segurança e validações robustas
- Sistema de analytics integrado
- Fácil de customizar e estender

Para suporte ou dúvidas, consulte a documentação do Supabase ou abra uma issue no repositório.