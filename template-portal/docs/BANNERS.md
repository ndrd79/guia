# 🎯 Sistema de Banners - Documentação

Este documento explica as posições de banner disponíveis e como configurá-las.

---

## 📍 Posições Disponíveis

| Posição | Dimensões | Onde Aparece |
|---------|-----------|--------------|
| `Hero Carousel` | 1170x330 | Topo da home, abaixo do menu |
| `CTA Banner` | 600x400 | Seção CTA (fundo escuro) |
| `Categorias Banner` | 1170x330 | Acima das categorias |
| `Serviços Banner` | 1170x330 | Abaixo dos serviços úteis |
| `Sidebar Banner` | 300x250 | Lateral das páginas internas |
| `Footer Banner` | 728x90 | Acima do footer |
| `Content Banner` | 728x90 | Meio do conteúdo de notícias |

---

## 🗄️ Estrutura da Tabela (Supabase)

```sql
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,           -- Nome identificador
  imagem VARCHAR(500) NOT NULL,         -- URL da imagem (Supabase Storage)
  link VARCHAR(500),                    -- URL de destino ao clicar
  posicao VARCHAR(100),                 -- Posição do banner
  local VARCHAR(100) DEFAULT 'geral',   -- Página específica ou geral
  largura INTEGER DEFAULT 1170,         -- Largura em pixels
  altura INTEGER DEFAULT 330,           -- Altura em pixels
  ordem INTEGER DEFAULT 0,              -- Ordem de exibição (menor = primeiro)
  ativo BOOLEAN DEFAULT TRUE,           -- Ativo/Inativo
  data_inicio TIMESTAMP,                -- Data de início (opcional)
  data_fim TIMESTAMP,                   -- Data de fim (opcional)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Como Usar nos Componentes

### Componente BannerCarousel

```tsx
import BannerCarousel from '../components/BannerCarousel';

// Na página
<BannerCarousel 
  position="Hero Carousel"    // Nome da posição
  local="home"                // Página: home, noticias, guia, etc.
  interval={6000}             // Tempo de rotação (ms)
  autoRotate={true}           // Auto-rotacionar
  maxBanners={5}              // Máximo de banners (0 = todos)
  className="rounded-xl"      // Classes CSS extras
/>
```

### Componente BannerSlot (banner único)

```tsx
import { BannerSlot } from '../components/BannerContainer';

<BannerSlot 
  position="Sidebar Banner"
  local="noticias"
  className="mb-4"
/>
```

---

## 📊 Recomendações de Tamanho

### Desktop

| Tipo | Largura | Altura | Aspect Ratio |
|------|---------|--------|--------------|
| Hero | 1170px | 330px | 3.55:1 |
| Sidebar | 300px | 250px | 1.2:1 |
| Leaderboard | 728px | 90px | 8:1 |
| CTA | 600px | 400px | 1.5:1 |

### Mobile

Os banners são responsivos. O componente ajusta automaticamente baseado no container.

---

## 💡 Boas Práticas

1. **Nomes descritivos** - Use nomes que identifiquem o anunciante
2. **Imagens otimizadas** - Use WebP quando possível
3. **Links com UTM** - Adicione parâmetros UTM para tracking
4. **Agendamento** - Use data_inicio/data_fim para campanhas temporárias
5. **Ordem** - Banners pagos devem ter ordem menor (aparecem primeiro)

---

## 🔄 Fluxo de Exibição

```
1. Página carrega
   ↓
2. Componente busca banners:
   - position = posição solicitada
   - local = página atual OU 'geral'
   - ativo = true
   - data_inicio <= agora <= data_fim (se definido)
   ↓
3. Ordena por campo 'ordem'
   ↓
4. Renderiza banners
```

---

## 🚀 Deploy de Novos Banners

1. Faça upload da imagem no Supabase Storage (bucket: banners)
2. No admin, crie novo banner com a URL da imagem
3. Selecione posição e página
4. Defina ordem (menor = primeiro)
5. Ative o banner
6. Aguarde cache atualizar (ou force revalidation)
