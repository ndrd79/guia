# Sistema de Banners Melhorado - Documentação Técnica

## 1. Análise do Sistema Atual

### 1.1 Status dos Banners Grandes ✅
Os banners grandes estão funcionando corretamente:
- **Hero Carousel**: 1200x400px - Funcionando perfeitamente
- **Banner Principal**: 970x250px - Alinhamento correto
- **Footer Banner**: 728x90px - Responsivo adequado

### 1.2 Problemas Identificados nos Banners Menores ⚠️
- **Alinhamento inconsistente** em dispositivos móveis
- **Espaçamento inadequado** entre banners e conteúdo
- **Falta de posições estratégicas** para banners pequenos
- **Responsividade limitada** para tamanhos menores
- **Quebras de layout** em telas pequenas

### 1.3 Posições Atuais Disponíveis
```
1. Hero Carousel (1200x400)
2. Banner Principal (970x250)
3. Header Inferior (970x90)
4. Empresas Destaque - Rodapé 1-3 (300x250)
5. Eventos - Rodapé (728x90)
6. Sidebar Direita/Esquerda (300x600)
7. Entre Conteúdo (336x280)
8. Footer (728x90)
```

## 2. Melhorias para Banners Menores

### 2.1 Novos Tamanhos Otimizados

#### Banner Mobile (320x50)
```css
.banner-mobile {
  width: 320px;
  height: 50px;
  aspect-ratio: 320/50;
  margin: 1rem auto;
}

@media (max-width: 640px) {
  .banner-mobile {
    width: 100%;
    max-width: 320px;
  }
}
```

#### Banner Quadrado Pequeno (250x250)
```css
.banner-square-small {
  width: 250px;
  height: 250px;
  aspect-ratio: 1/1;
  margin: 1rem auto;
}

@media (max-width: 768px) {
  .banner-square-small {
    width: 200px;
    height: 200px;
  }
}
```

#### Banner Retângulo Compacto (300x100)
```css
.banner-compact {
  width: 300px;
  height: 100px;
  aspect-ratio: 3/1;
  margin: 1rem auto;
}

@media (max-width: 640px) {
  .banner-compact {
    width: 100%;
    max-width: 300px;
    height: auto;
  }
}
```

### 2.2 Sistema de Alinhamento Melhorado

#### Container Flexível
```css
.banner-container-flex {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
}

.banner-container-flex.left {
  justify-content: flex-start;
}

.banner-container-flex.right {
  justify-content: flex-end;
}
```

#### Grid Responsivo
```css
.banner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .banner-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.5rem;
  }
}
```

## 3. Novas Posições de Banners

### 3.1 Posições no Header
```typescript
// Novas posições para o header
const headerPositions = [
  {
    nome: 'Header - Topo Absoluto',
    descricao: 'Banner no topo da página, acima de tudo',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Todas as páginas'],
    tipo: 'inline'
  },
  {
    nome: 'Header - Entre Logo e Menu',
    descricao: 'Banner entre o logo e o menu principal',
    tamanhoRecomendado: '320x50 (Mobile Banner)',
    larguraRecomendada: 320,
    alturaRecomendada: 50,
    paginas: ['Todas as páginas'],
    tipo: 'mobile'
  }
]
```

### 3.2 Posições no Conteúdo
```typescript
const contentPositions = [
  {
    nome: 'Conteúdo - Início',
    descricao: 'Banner no início do conteúdo principal',
    tamanhoRecomendado: '300x100 (Compact)',
    larguraRecomendada: 300,
    alturaRecomendada: 100,
    paginas: ['Notícias', 'Eventos', 'Empresas'],
    tipo: 'compact'
  },
  {
    nome: 'Conteúdo - Meio',
    descricao: 'Banner no meio do conteúdo (após 2º parágrafo)',
    tamanhoRecomendado: '250x250 (Square)',
    larguraRecomendada: 250,
    alturaRecomendada: 250,
    paginas: ['Notícias', 'Eventos'],
    tipo: 'square'
  },
  {
    nome: 'Conteúdo - Final',
    descricao: 'Banner no final do conteúdo principal',
    tamanhoRecomendado: '320x50 (Mobile)',
    larguraRecomendada: 320,
    alturaRecomendada: 50,
    paginas: ['Todas as páginas'],
    tipo: 'mobile'
  }
]
```

### 3.3 Posições em Páginas Específicas

#### Página de Empresas Locais
```typescript
const empresasLocaisPositions = [
  {
    nome: 'Empresas Locais - Topo',
    descricao: 'Banner acima da lista de empresas',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Empresas Locais'],
    tipo: 'inline'
  },
  {
    nome: 'Empresas Locais - Entre Cards',
    descricao: 'Banner entre os cards de empresas (a cada 6 empresas)',
    tamanhoRecomendado: '300x100 (Compact)',
    larguraRecomendada: 300,
    alturaRecomendada: 100,
    paginas: ['Empresas Locais'],
    tipo: 'compact'
  },
  {
    nome: 'Empresas Locais - Sidebar',
    descricao: 'Banner na lateral dos filtros',
    tamanhoRecomendado: '250x250 (Square)',
    larguraRecomendada: 250,
    alturaRecomendada: 250,
    paginas: ['Empresas Locais'],
    tipo: 'square'
  }
]
```

#### Página de Notícias
```typescript
const noticiasPositions = [
  {
    nome: 'Notícias - Lista Topo',
    descricao: 'Banner acima da lista de notícias',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Lista de Notícias'],
    tipo: 'inline'
  },
  {
    nome: 'Notícias - Entre Lista',
    descricao: 'Banner entre notícias (a cada 4 notícias)',
    tamanhoRecomendado: '300x100 (Compact)',
    larguraRecomendada: 300,
    alturaRecomendada: 100,
    paginas: ['Lista de Notícias'],
    tipo: 'compact'
  },
  {
    nome: 'Notícia - Após Título',
    descricao: 'Banner logo após o título da notícia',
    tamanhoRecomendado: '320x50 (Mobile)',
    larguraRecomendada: 320,
    alturaRecomendada: 50,
    paginas: ['Detalhes da Notícia'],
    tipo: 'mobile'
  }
]
```

## 4. Correções de Alinhamento

### 4.1 Sistema de Grid Responsivo Melhorado

```css
/* Container principal para banners */
.banner-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Grid para múltiplos banners */
.banner-multi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: start;
  justify-items: center;
}

@media (max-width: 768px) {
  .banner-multi-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Alinhamento específico por tipo */
.banner-center-align {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.banner-left-align {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.banner-right-align {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
```

### 4.2 Espaçamento Consistente

```css
/* Espaçamento vertical entre banners e conteúdo */
.banner-spacing-top {
  margin-top: 2rem;
}

.banner-spacing-bottom {
  margin-bottom: 2rem;
}

.banner-spacing-both {
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .banner-spacing-top,
  .banner-spacing-bottom,
  .banner-spacing-both {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
}

/* Espaçamento horizontal */
.banner-spacing-horizontal {
  margin-left: 1rem;
  margin-right: 1rem;
}

@media (max-width: 640px) {
  .banner-spacing-horizontal {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}
```

### 4.3 Prevenção de Quebras de Layout

```css
/* Contenção de overflow */
.banner-container-safe {
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

/* Imagens responsivas */
.banner-image-responsive {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: cover;
  display: block;
}

/* Fallback para banners muito largos */
.banner-overflow-protection {
  max-width: calc(100vw - 2rem);
  margin: 0 auto;
}

@media (max-width: 640px) {
  .banner-overflow-protection {
    max-width: calc(100vw - 1rem);
  }
}
```

## 5. Implementação Técnica

### 5.1 Componente BannerContainer Atualizado

```typescript
interface BannerContainerProps {
  position: string
  className?: string
  width?: number
  height?: number
  showPlaceholder?: boolean
  bannerType?: 'sidebar' | 'inline' | 'small' | 'mobile' | 'compact' | 'square' | 'custom'
  alignment?: 'center' | 'left' | 'right'
  spacing?: 'none' | 'small' | 'medium' | 'large'
}

const BannerContainer: React.FC<BannerContainerProps> = ({
  position,
  className = '',
  width,
  height,
  showPlaceholder = true,
  bannerType = 'custom',
  alignment = 'center',
  spacing = 'medium'
}) => {
  const { banner, loading, error } = useBanner(position)
  const { trackImpression } = useAnalytics()

  // Classes CSS baseadas no tipo e alinhamento
  const getContainerClasses = () => {
    const baseClasses = ['banner-container-safe']
    
    // Tipo de banner
    switch (bannerType) {
      case 'mobile':
        baseClasses.push('banner-mobile')
        break
      case 'compact':
        baseClasses.push('banner-compact')
        break
      case 'square':
        baseClasses.push('banner-square-small')
        break
      case 'sidebar':
        baseClasses.push('banner-sidebar')
        break
      case 'inline':
        baseClasses.push('banner-inline')
        break
    }
    
    // Alinhamento
    switch (alignment) {
      case 'left':
        baseClasses.push('banner-left-align')
        break
      case 'right':
        baseClasses.push('banner-right-align')
        break
      default:
        baseClasses.push('banner-center-align')
    }
    
    // Espaçamento
    switch (spacing) {
      case 'small':
        baseClasses.push('banner-spacing-small')
        break
      case 'large':
        baseClasses.push('banner-spacing-large')
        break
      case 'medium':
        baseClasses.push('banner-spacing-both')
        break
    }
    
    return baseClasses.join(' ')
  }

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {/* Conteúdo do banner */}
    </div>
  )
}
```

### 5.2 Hook useBanner Melhorado

```typescript
export const useBanner = (position: string) => {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('banners')
          .select('*')
          .eq('posicao', position)
          .eq('ativo', true)
          .maybeSingle()

        if (fetchError) {
          throw fetchError
        }

        setBanner(data)
      } catch (err) {
        console.error('Erro ao buscar banner:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [position])

  return { banner, loading, error }
}
```

## 6. Posições Sugeridas Completas

### 6.1 Lista Completa de Novas Posições

```typescript
const novasPosicoesCompletas = [
  // Header
  {
    nome: 'Header - Topo Absoluto',
    descricao: 'Banner fixo no topo da página',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Todas as páginas'],
    tipo: 'inline',
    prioridade: 'alta'
  },
  
  // Mobile específico
  {
    nome: 'Mobile - Topo',
    descricao: 'Banner otimizado para mobile no topo',
    tamanhoRecomendado: '320x50 (Mobile Banner)',
    larguraRecomendada: 320,
    alturaRecomendada: 50,
    paginas: ['Todas as páginas'],
    tipo: 'mobile',
    prioridade: 'alta'
  },
  
  // Conteúdo
  {
    nome: 'Conteúdo - Entre Seções',
    descricao: 'Banner entre seções de conteúdo',
    tamanhoRecomendado: '300x100 (Compact)',
    larguraRecomendada: 300,
    alturaRecomendada: 100,
    paginas: ['Notícias', 'Eventos', 'Empresas'],
    tipo: 'compact',
    prioridade: 'média'
  },
  
  // Sidebar adicional
  {
    nome: 'Sidebar - Quadrado Pequeno',
    descricao: 'Banner quadrado para sidebar',
    tamanhoRecomendado: '250x250 (Square)',
    larguraRecomendada: 250,
    alturaRecomendada: 250,
    paginas: ['Notícias', 'Eventos', 'Empresas'],
    tipo: 'square',
    prioridade: 'média'
  },
  
  // Footer adicional
  {
    nome: 'Footer - Múltiplo 1',
    descricao: 'Primeiro banner no footer (esquerda)',
    tamanhoRecomendado: '300x100 (Compact)',
    larguraRecomendada: 300,
    alturaRecomendada: 100,
    paginas: ['Todas as páginas'],
    tipo: 'compact',
    prioridade: 'baixa'
  },
  
  {
    nome: 'Footer - Múltiplo 2',
    descricao: 'Segundo banner no footer (centro)',
    tamanhoRecomendado: '300x100 (Compact)',
    larguraRecomendada: 300,
    alturaRecomendada: 100,
    paginas: ['Todas as páginas'],
    tipo: 'compact',
    prioridade: 'baixa'
  },
  
  {
    nome: 'Footer - Múltiplo 3',
    descricao: 'Terceiro banner no footer (direita)',
    tamanhoRecomendado: '300x100 (Compact)',
    larguraRecomendada: 300,
    alturaRecomendada: 100,
    paginas: ['Todas as páginas'],
    tipo: 'compact',
    prioridade: 'baixa'
  }
]
```

## 7. CSS Completo Atualizado

### 7.1 Estilos Base Melhorados

```css
/* Novos tipos de banner */
.banner-mobile {
  width: 320px;
  height: 50px;
  aspect-ratio: 320/50;
  margin: 1rem auto;
  max-width: 100%;
}

.banner-compact {
  width: 300px;
  height: 100px;
  aspect-ratio: 3/1;
  margin: 1rem auto;
  max-width: 100%;
}

.banner-square-small {
  width: 250px;
  height: 250px;
  aspect-ratio: 1/1;
  margin: 1rem auto;
  max-width: 100%;
}

/* Responsividade melhorada */
@media (max-width: 640px) {
  .banner-mobile {
    width: 100%;
    max-width: 320px;
    height: auto;
    min-height: 50px;
  }
  
  .banner-compact {
    width: 100%;
    max-width: 300px;
    height: auto;
    min-height: 100px;
  }
  
  .banner-square-small {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .banner-square-small {
    width: 150px;
    height: 150px;
  }
}

/* Sistema de alinhamento */
.banner-center-align {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.banner-left-align {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.banner-right-align {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

/* Espaçamento */
.banner-spacing-small {
  margin: 0.5rem 0;
}

.banner-spacing-medium {
  margin: 1rem 0;
}

.banner-spacing-large {
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .banner-spacing-large {
    margin: 1rem 0;
  }
}

/* Grid para múltiplos banners */
.banner-multi-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .banner-multi-container {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0.5rem;
  }
}

/* Proteção contra overflow */
.banner-container-safe {
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

.banner-overflow-protection {
  max-width: calc(100vw - 2rem);
  margin: 0 auto;
}

@media (max-width: 640px) {
  .banner-overflow-protection {
    max-width: calc(100vw - 1rem);
  }
}
```

## 8. Implementação Prática

### 8.1 Passos para Implementação

1. **Atualizar CSS Global**
   - Adicionar novos estilos ao `globals.css`
   - Testar responsividade em diferentes dispositivos

2. **Atualizar Componente BannerContainer**
   - Adicionar novos props para tipo e alinhamento
   - Implementar lógica de classes CSS

3. **Atualizar Painel Administrativo**
   - Adicionar novas posições ao array `posicoesBanner`
   - Testar criação de banners com novos tamanhos

4. **Implementar em Páginas**
   - Adicionar banners nas novas posições
   - Testar alinhamento e espaçamento

5. **Testes de Responsividade**
   - Testar em mobile, tablet e desktop
   - Verificar quebras de layout
   - Ajustar espaçamentos se necessário

### 8.2 Checklist de Qualidade

- [ ] Banners não quebram layout em mobile
- [ ] Alinhamento consistente em todas as telas
- [ ] Espaçamento adequado entre banners e conteúdo
- [ ] Performance não afetada
- [ ] Acessibilidade mantida
- [ ] SEO não prejudicado

## 9. Conclusão

Este sistema melhorado de banners oferece:

✅ **Banners menores otimizados** com tamanhos específicos para mobile
✅ **Alinhamento automático** baseado em CSS Grid e Flexbox
✅ **Mais posições estratégicas** em todas as páginas
✅ **Responsividade aprimorada** para todos os dispositivos
✅ **Sistema de espaçamento consistente**
✅ **Prevenção de quebras de layout**

O sistema está pronto para implementação e oferece uma base sólida para expansão futura.