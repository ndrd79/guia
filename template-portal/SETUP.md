# 📖 Guia de Configuração - Template Portal

Este guia detalha como configurar o template para um novo cliente.

---

## 🔧 Passo 1: Configurar site.config.ts

Edite o arquivo `config/site.config.ts` com as informações do cliente:

```typescript
export const siteConfig = {
  // INFORMAÇÕES BÁSICAS
  name: "Portal Sua Cidade",
  description: "Guia comercial e notícias de Sua Cidade",
  slogan: "Sua cidade em um só lugar",
  
  // CONTATO
  contact: {
    phone: "(XX) XXXXX-XXXX",
    whatsapp: "55XXXXXXXXXXX",
    email: "contato@suacidade.com.br",
    address: "Rua Principal, 123 - Sua Cidade, PR"
  },
  
  // REDES SOCIAIS
  social: {
    facebook: "https://facebook.com/suapagina",
    instagram: "https://instagram.com/suapagina",
    youtube: "",
    twitter: ""
  },
  
  // SEO
  seo: {
    title: "Portal Sua Cidade - Guia Comercial & Eventos",
    description: "Portal oficial de Sua Cidade...",
    keywords: ["sua cidade", "guia comercial", "notícias"],
    ogImage: "/images/og-image.jpg"
  }
}
```

---

## 🎨 Passo 2: Personalizar Cores

### Opção A: Editar colors.css

Abra `design-system/colors.css` e altere as variáveis:

```css
:root {
  --primary-500: #SEU_AZUL;
  --primary-600: #SEU_AZUL_ESCURO;
  --accent: #SUA_COR_DESTAQUE;
}
```

### Opção B: Editar tailwind.config.js

Altere a seção `colors`:

```javascript
colors: {
  primary: {
    500: '#sua_cor',
    600: '#sua_cor_escura',
  }
}
```

---

## 🗄️ Passo 3: Criar Banco de Dados (Supabase)

### 1. Criar projeto no Supabase
Acesse https://supabase.com e crie um novo projeto.

### 2. Executar SQL das tabelas

```sql
-- Tabela de Notícias
CREATE TABLE noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  conteudo TEXT,
  imagem VARCHAR(500),
  categoria VARCHAR(100),
  data TIMESTAMP DEFAULT NOW(),
  destaque BOOLEAN DEFAULT FALSE,
  workflow_status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Empresas
CREATE TABLE empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  location VARCHAR(255),
  image VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  plan_type VARCHAR(50) DEFAULT 'free',
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Classificados
CREATE TABLE classificados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  preco DECIMAL(10,2),
  imagem VARCHAR(500),
  localizacao VARCHAR(255),
  contato VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Eventos
CREATE TABLE eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP,
  data_fim TIMESTAMP,
  local VARCHAR(255),
  imagem VARCHAR(500),
  categoria VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Banners
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  imagem VARCHAR(500) NOT NULL,
  link VARCHAR(500),
  posicao VARCHAR(100),
  local VARCHAR(100) DEFAULT 'geral',
  largura INTEGER DEFAULT 1170,
  altura INTEGER DEFAULT 330,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  data_inicio TIMESTAMP,
  data_fim TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Profiles (para admin)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Configurar Storage

1. Crie um bucket chamado `banners` (público)
2. Crie um bucket chamado `images` (público)

### 4. Configurar RLS (Row Level Security)

```sql
-- Enable RLS
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE classificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Leitura pública" ON noticias FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON empresas FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON classificados FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON eventos FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON banners FOR SELECT USING (true);
```

---

## 🔐 Passo 4: Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...

# Opcional: Para funcionalidades avançadas
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
```

---

## 🖼️ Passo 5: Trocar Logo e Favicon

1. Substitua `/public/favicon.svg` pelo favicon do cliente
2. Adicione logo em `/public/images/logo.png`
3. Atualize referências nos componentes

---

## ✅ Checklist Final

- [ ] site.config.ts configurado
- [ ] Cores personalizadas (se necessário)
- [ ] Projeto Supabase criado
- [ ] Tabelas criadas no banco
- [ ] Storage configurado
- [ ] .env.local com credenciais
- [ ] Logo e favicon substituídos
- [ ] Teste local funcionando (`npm run dev`)

---

## 🚀 Deploy

Recomendado: **Vercel**

1. Push para GitHub
2. Conecte ao Vercel
3. Adicione as variáveis de ambiente
4. Deploy automático!
