# 🔧 Configuração do Supabase - Portal Maria Helena

## 📋 Passo a Passo para Configuração

### 1. Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/org/lyymoqlldbwxzgxjtdha
2. Faça login na sua conta Supabase
3. Você verá o dashboard da sua organização

### 2. Criar Novo Projeto

1. Clique em **"New Project"**
2. Preencha as informações:
   - **Name**: `Portal Maria Helena`
   - **Database Password**: Crie uma senha forte (anote em local seguro)
   - **Region**: `South America (São Paulo)` (para melhor performance no Brasil)
   - **Pricing Plan**: `Free` (para começar)
3. Clique em **"Create new project"**
4. Aguarde alguns minutos para o projeto ser criado

### 3. Obter as Chaves de API

1. No dashboard do projeto, vá em **Settings** (ícone de engrenagem)
2. Clique em **"API"** no menu lateral
3. Você verá as seguintes informações:
   - **Project URL**: `https://[seu-projeto-id].supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ **SECRETA**)

### 4. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` no projeto
2. Substitua os valores pelos dados reais do seu projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anon-publica]
SUPABASE_SERVICE_ROLE_KEY=[sua-chave-service-role-secreta]

# Admin Credentials
ADMIN_EMAIL=admin@portal.com
ADMIN_PASSWORD=123456
```

### 5. Executar Script SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em **"Run"** para executar
6. Verifique se todas as tabelas foram criadas em **Table Editor**

### 6. Configurar Storage

1. Vá em **Storage** no dashboard
2. Os buckets já foram criados pelo script SQL:
   - ✅ `noticias`
   - ✅ `classificados`
   - ✅ `eventos`
   - ✅ `banners`

### 7. Criar Usuário Administrador

1. Vá em **Authentication** → **Users**
2. Clique em **"Add user"**
3. Preencha:
   - **Email**: `admin@portal.com`
   - **Password**: `123456`
   - **Email Confirm**: ✅ (marque esta opção)
4. Clique em **"Create user"**

### 8. Testar a Configuração

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:3000/admin/login

3. Faça login com:
   - **Email**: admin@portal.com
   - **Senha**: 123456

4. Se tudo estiver correto, você será redirecionado para o dashboard admin

## 🔒 Segurança

### ⚠️ IMPORTANTE - Proteção das Chaves

- **NUNCA** compartilhe a `service_role` key
- **NUNCA** commite o arquivo `.env.local` no Git
- A `anon` key é pública e pode ser exposta no frontend
- A `service_role` key tem acesso total ao banco de dados

### 🛡️ Políticas de Segurança (RLS)

O script SQL já configurou as políticas de Row Level Security:
- ✅ Leitura pública para todos os conteúdos
- ✅ CRUD apenas para usuários autenticados
- ✅ Upload de arquivos apenas para usuários autenticados

## 🚨 Solução de Problemas

### Erro de Conexão
- Verifique se as URLs e chaves estão corretas
- Confirme se o projeto foi criado com sucesso
- Verifique se não há espaços extras nas variáveis

### Erro de Autenticação
- Confirme se o usuário foi criado
- Verifique se o email foi confirmado
- Teste com as credenciais exatas: admin@portal.com / 123456

### Erro de Upload
- Verifique se os buckets foram criados
- Confirme se as políticas de Storage estão ativas
- Teste com arquivos menores que 5MB

### Erro de Banco de Dados
- Execute novamente o script SQL completo
- Verifique se todas as tabelas foram criadas
- Confirme se as políticas RLS estão ativas

## 📞 Suporte

- **Documentação Supabase**: https://supabase.com/docs
- **Dashboard da Organização**: https://supabase.com/dashboard/org/lyymoqlldbwxzgxjtdha
- **Logs do Projeto**: Disponíveis no dashboard do Supabase

---

✅ **Após seguir todos os passos, o painel administrativo estará totalmente funcional!**