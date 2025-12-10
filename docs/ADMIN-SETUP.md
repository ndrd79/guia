# 🔧 Configuração do Painel Administrativo - Portal Maria Helena

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Node.js 16+ instalado
3. Projeto Next.js configurado

## 🚀 Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Clique em "New Project"
5. Preencha:
   - **Name**: Portal Maria Helena
   - **Database Password**: Crie uma senha segura
   - **Region**: South America (São Paulo)
6. Clique em "Create new project"

### 2. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public key**
   - **service_role key** (mantenha em segredo)

3. Atualize o arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Admin inicial
ADMIN_EMAIL=admin@portal.com
ADMIN_PASSWORD=123456
```

### 3. Executar Script SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie e cole todo o conteúdo do arquivo `supabase-schema.sql`
4. Clique em "Run" para executar

### 4. Configurar Storage

1. Vá em **Storage** no dashboard
2. Os buckets já foram criados pelo script SQL:
   - `noticias`
   - `classificados`
   - `eventos`
   - `banners`

### 5. Criar Usuário Administrador

1. Vá em **Authentication** → **Users**
2. Clique em "Add user"
3. Preencha:
   - **Email**: admin@portal.com
   - **Password**: 123456
   - **Email Confirm**: ✅ (marcado)
4. Clique em "Create user"

## 🖥️ Executar o Projeto

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar em Desenvolvimento

```bash
npm run dev
```

### 3. Acessar o Painel

1. Abra o navegador em `http://localhost:3000`
2. Acesse `http://localhost:3000/admin/login`
3. Faça login com:
   - **Email**: admin@portal.com
   - **Senha**: 123456

## 📱 Funcionalidades do Painel

### 🏠 Dashboard (`/admin`)
- Visão geral com estatísticas
- Contadores de conteúdo
- Ações rápidas
- Informações do sistema

### 📰 Notícias (`/admin/noticias`)
- ✅ Criar notícias
- ✅ Editar notícias
- ✅ Excluir notícias
- ✅ Upload de imagens
- ✅ Categorização
- ✅ Listagem com filtros

### 📦 Classificados (`/admin/classificados`)
- ✅ Criar anúncios
- ✅ Editar anúncios
- ✅ Excluir anúncios
- ✅ Upload de imagens
- ✅ Definir preços
- ✅ Localização

### 🎉 Eventos (`/admin/eventos`)
- ✅ Criar eventos
- ✅ Editar eventos
- ✅ Excluir eventos
- ✅ Upload de imagens
- ✅ Data e hora
- ✅ Localização

### 🖼️ Banners (`/admin/banners`)
- ✅ Criar banners publicitários
- ✅ Editar banners
- ✅ Excluir banners
- ✅ Upload de imagens
- ✅ Definir posições
- ✅ Links externos
- ✅ Ativar/Desativar

## 🔒 Segurança

### Autenticação
- Login obrigatório para acessar `/admin`
- Sessão gerenciada pelo Supabase Auth
- Redirecionamento automático para login

### Upload de Arquivos
- Validação de tipo de arquivo (imagens)
- Limite de tamanho (5MB)
- Nomes únicos para evitar conflitos
- Armazenamento seguro no Supabase Storage

### Validação de Dados
- Validação client-side com React Hook Form
- Validação server-side com Zod
- Sanitização de inputs
- Proteção contra XSS

## 🎨 Tecnologias Utilizadas

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Estilização**: Tailwind CSS

## 🔧 Estrutura do Projeto

```
pages/admin/
├── index.tsx          # Dashboard principal
├── login.tsx          # Página de login
├── noticias.tsx       # Gerenciar notícias
├── classificados.tsx  # Gerenciar classificados
├── eventos.tsx        # Gerenciar eventos
└── banners.tsx        # Gerenciar banners

components/admin/
├── AdminLayout.tsx    # Layout do painel
├── FormCard.tsx       # Card para formulários
└── ImageUploader.tsx  # Componente de upload

lib/
└── supabase.ts        # Configuração do Supabase
```

## 🚨 Solução de Problemas

### Erro de Autenticação
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o usuário foi criado no Supabase
- Verifique se o email foi confirmado

### Erro de Upload
- Verifique se os buckets foram criados
- Confirme as políticas de Storage
- Verifique o tamanho do arquivo (máx. 5MB)

### Erro de Banco de Dados
- Execute novamente o script SQL
- Verifique as políticas RLS
- Confirme a conexão com o Supabase

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do [Supabase](https://supabase.com/docs)
2. Consulte os logs do navegador (F12)
3. Verifique os logs do Supabase Dashboard

---

✅ **Painel Administrativo Completo e Funcional!**

O Portal Maria Helena agora possui um sistema completo de gerenciamento de conteúdo com autenticação segura, upload de imagens e interface responsiva.