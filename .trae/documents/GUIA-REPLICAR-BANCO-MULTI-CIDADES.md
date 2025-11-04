# 🏙️ GUIA: Replicar Banco de Dados para Multi-Cidades

## 📋 Visão Geral

Este guia ensina como replicar o banco de dados do seu site atual (Portal Maria Helena) para criar um novo site idêntico para outra cidade, mantendo os dados isolados e seguros.

## 🎯 Objetivo
- Criar um novo site idêntico para outra cidade
- Isolar completamente os dados entre cidades
- Manter a mesma estrutura e funcionalidades
- Facilitar futuras expansões para mais cidades

---

## 🔧 Passo 1: Backup Completo do Banco Atual

### 1.1 Exportar Schema (Estrutura)
```bash
# Usando Supabase CLI (recomendado)
supabase db dump --schema-only > backup-schema-atual.sql

# Ou via Dashboard Supabase
# Vá em: SQL Editor → New Query → Executar:
```

### 1.2 Exportar Dados
```bash
# Backup completo com dados
supabase db dump > backup-completo-atual.sql

# Backup apenas tabelas principais (sem dados sensíveis)
supabase db dump --data-only --table=profiles --table=categorias > backup-dados-base.sql
```

### 1.3 Documentar Storage Buckets
```sql
-- Execute no SQL Editor para listar buckets
SELECT * FROM storage.buckets;

-- Anotar nomes dos buckets existentes:
-- - noticias
-- - classificados  
-- - eventos
-- - banners
```

---

## 🚀 Passo 2: Criar Novo Projeto Supabase

### 2.1 Criar Novo Projeto
1. Acesse: [https://app.supabase.com](https://app.supabase.com)
2. Clique em "New Project"
3. Configure:
   - **Name**: `portal-[nome-cidade]` (ex: `portal-santa-helena`)
   - **Database Password**: Use senha forte e anote!
   - **Region**: Escolha a mais próxima geograficamente
   - **Pricing Plan**: Mesmo plano do projeto original

### 2.2 Anotar Credenciais Importantes
Após criar, anote:
- **Project URL**: `https://[projeto].supabase.co`
- **Anon Key**: `[chave-pública]`
- **Service Role Key**: `[chave-privada]`
- **Database Host**: `db.[projeto].supabase.co`

---

## 📊 Passo 3: Migrar Schema e Estrutura

### 3.1 Conectar ao Novo Banco
```bash
# Configure CLI para novo projeto
supabase login
supabase link --project-ref [ref-do-novo-projeto]
```

### 3.2 Executar Schema Base
```sql
-- Copie o conteúdo de supabase-schema.sql do projeto original
-- Execute no SQL Editor do novo projeto:

-- Estrutura baseada no seu projeto atual
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de perfis
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
    cidade TEXT DEFAULT 'santa-helena', -- ADICIONAR CAMPO CIDADE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de empresas
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    cidade TEXT DEFAULT 'santa-helena', -- ADICIONAR CAMPO CIDADE
    destaque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de noticias
CREATE TABLE noticias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    conteudo TEXT,
    imagem_url TEXT,
    cidade TEXT DEFAULT 'santa-helena', -- ADICIONAR CAMPO CIDADE
    destaque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_evento DATE,
    local TEXT,
    cidade TEXT DEFAULT 'santa-helena', -- ADICIONAR CAMPO CIDADE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Configurar RLS (Row Level Security)
```sql
-- Ativar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Políticas base (leitura pública, escrita para autenticados)
CREATE POLICY "Leitura pública empresas" ON empresas FOR SELECT USING (true);
CREATE POLICY "CRUD autenticados empresas" ON empresas FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Leitura pública noticias" ON noticias FOR SELECT USING (true);
CREATE POLICY "CRUD autenticados noticias" ON noticias FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Leitura pública eventos" ON eventos FOR SELECT USING (true);
CREATE POLICY "CRUD autenticados eventos" ON eventos FOR ALL USING (auth.role() = 'authenticated');

-- Política para profiles (usuários veem apenas próprio perfil)
CREATE POLICY "Usuário vê próprio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuário edita próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin vê todos profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 📁 Passo 4: Configurar Storage Buckets

### 4.1 Criar Buckets Necessários
```sql
-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public) VALUES
('noticias', 'noticias', true),
('classificados', 'classificados', true),
('eventos', 'eventos', true),
('banners', 'banners', true);

-- Configurar políticas de acesso
CREATE POLICY "Acesso público noticias" ON storage.objects FOR SELECT USING (bucket_id = 'noticias');
CREATE POLICY "Upload autenticado noticias" ON storage.objects FOR INSERT USING (
    bucket_id = 'noticias' AND auth.role() = 'authenticated'
);
CREATE POLICY "Delete admin noticias" ON storage.objects FOR DELETE USING (
    bucket_id = 'noticias' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Repetir para outros buckets...
```

---

## 🔐 Passo 5: Configurar Variáveis de Ambiente

### 5.1 No Novo Repositório
Crie arquivo `.env.local` na raiz:
```bash
# Supabase (NOVO PROJETO)
NEXT_PUBLIC_SUPABASE_URL=https://[novo-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-do-novo-projeto]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key-do-novo-projeto]

# Configurações da Cidade
NEXT_PUBLIC_CIDADE_NOME=Santa Helena
NEXT_PUBLIC_CIDADE_ESTADO=PR
NEXT_PUBLIC_SITE_URL=https://portal-santa-helena.vercel.app

# Email (se usar notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

### 5.2 Adicionar no Git (Opcional)
```bash
# Adicione ao .gitignore se não quiser commitar
 echo ".env.local" >> .gitignore
```

---

## 🏗️ Passo 6: Ajustes no Código para Multi-Cidades

### 6.1 Adicionar Filtro por Cidade
```typescript
// Exemplo: pages/api/empresas.ts
import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
  const cidade = process.env.NEXT_PUBLIC_CIDADE_NOME || 'santa-helena'
  
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('cidade', cidade) // FILTRAR POR CIDADE
    .order('created_at', { ascending: false })
  
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data)
}
```

### 6.2 Middleware para Verificar Cidade
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const cidade = process.env.NEXT_PUBLIC_CIDADE_NOME
  
  // Adicionar header com cidade para todas as requisições
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-cidade', cidade)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/api/:path*'],
}
```

---

## 🧪 Passo 7: Testar a Migração

### 7.1 Testes Locais
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Testar build
npm run build
```

### 7.2 Verificar Conexão
```bash
# Testar conexão com Supabase
node test-database.js

# Verificar se buckets foram criados
node test-storage.js
```

### 7.3 Popular Dados Iniciais
```sql
-- Inserir categorias padrão
INSERT INTO categorias (nome, slug, descricao) VALUES
('Restaurantes', 'restaurantes', 'Bares e restaurantes da cidade'),
('Comércio', 'comercio', 'Lojas e comércios locais'),
('Serviços', 'servicos', 'Prestadores de serviços'),
('Saúde', 'saude', 'Clínicas e profissionais de saúde'),
('Educação', 'educacao', 'Escolas e instituições de ensino');

-- Criar usuário admin inicial
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at) 
VALUES ('admin@santa-helena.com', crypt('senha123', gen_salt('bf')), NOW());

INSERT INTO profiles (id, email, name, role, cidade) 
VALUES ((SELECT id FROM auth.users WHERE email = 'admin@santa-helena.com'), 
        'admin@santa-helena.com', 'Administrador', 'admin', 'santa-helena');
```

---

## 🚀 Passo 8: Deploy no Novo Site

### 8.1 Configurar Vercel
1. Conecte novo repositório na Vercel
2. Configure Environment Variables (mesmas do .env.local)
3. Deploy inicial

### 8.2 Verificar Deploy
```bash
# Testar endpoints
curl https://portal-santa-helena.vercel.app/api/empresas
curl https://portal-santa-helena.vercel.app/api/noticias
```

---

## 📋 Checklist Final

### ✅ Antes de Lançar
- [ ] Schema migrado com sucesso
- [ ] RLS configurado corretamente
- [ ] Storage buckets criados
- [ ] Variáveis de ambiente configuradas
- [ ] Cidade configurada nas variáveis
- [ ] Admin criado e testado
- [ ] Testes locais passando
- [ ] Deploy realizado com sucesso
- [ ] Dados de teste inseridos
- [ ] Performance verificada

### 🔍 O que Verificar Após Deploy
- [ ] Login funciona
- [ ] Empresas listam corretamente
- [ ] Notícias aparecem
- [ ] Upload de imagens funciona
- [ ] Busca está funcionando
- [ ] Admin consegue criar/editar

---

## 💡 Dicas Importantes

### Segurança
- **Nunca** commite chaves de API
- Use diferentes senhas para cada cidade
- Configure backup automático no Supabase
- Monitore logs de acesso

### Performance
- Configure índices apropriados
- Use CDN para imagens
- Implemente cache onde possível
- Monitore uso de banda

### Manutenção
- Mantenha código sincronizado entre cidades
- Crie script para aplicar updates em todas as cidades
- Documente customizações por cidade
- Teste sempre antes de aplicar em produção

---

## 🆘 Troubleshooting

### Problemas Comuns

**Erro de conexão:**
```bash
# Verifique variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
```

**RLS bloqueando acesso:**
```sql
-- Desative temporariamente para testar
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
```

**Imagens não carregam:**
```sql
-- Verifique políticas de storage
SELECT * FROM storage.objects WHERE bucket_id = 'noticias';
```

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique logs no Supabase Dashboard
2. Teste localmente primeiro
3. Documente o erro específico
4. Consulte documentação oficial do Supabase

**Boa sorte com seu novo portal!** 🎉