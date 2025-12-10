# 🚀 Guia de Deploy no Vercel - Portal Maria Helena

## 📋 Pré-requisitos

1. ✅ Conta no [Vercel](https://vercel.com)
2. ✅ Projeto no GitHub/GitLab/Bitbucket
3. ✅ Configuração do Supabase completa

## 🔧 Configuração do Deploy

### 1. Conectar Repositório

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"New Project"**
3. Conecte seu repositório Git
4. Selecione o repositório `guia-comercio`

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings** → **Environment Variables** e adicione:

```bash
# Variáveis Públicas (podem ser expostas)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app

# Variáveis Privadas (apenas no servidor)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

### 3. Configurações de Build

O arquivo `vercel.json` já está configurado com:

- ✅ **Framework**: Next.js
- ✅ **Região**: Brasil (gru1)
- ✅ **Runtime**: Node.js 18.x
- ✅ **Headers de Segurança**
- ✅ **Rewrites para Admin**

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse sua URL do Vercel

## 🔒 Segurança

### Headers Configurados

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Variáveis de Ambiente

- ✅ Chaves sensíveis removidas do código
- ✅ Configuração via painel do Vercel
- ✅ Separação entre variáveis públicas e privadas

## 🌐 Domínio Personalizado

### Configurar Domínio

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções
4. Aguarde propagação (até 48h)

### Exemplo de Configuração DNS

```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com

Tipo: A
Nome: @
Valor: 76.76.19.61
```

## 📊 Monitoramento

### Analytics

- Acesse **Analytics** no painel do Vercel
- Monitore performance e visitantes
- Configure alertas se necessário

### Logs

- Vá em **Functions** → **View Function Logs**
- Monitore erros de API
- Debug problemas de produção

## 🚨 Solução de Problemas

### Build Falha

```bash
# Teste local antes do deploy
npm run build
npm run start
```

### Erro de Variáveis

1. Verifique se todas as variáveis estão configuradas
2. Confirme se os nomes estão corretos
3. Redeploy após alterações

### Erro de Supabase

1. Verifique URLs e chaves
2. Confirme políticas RLS
3. Teste conexão local

### Performance

1. Otimize imagens com Next.js Image
2. Use lazy loading
3. Minimize JavaScript

## 📱 URLs Importantes

### Produção
- 🏠 **Site**: https://seu-dominio.vercel.app
- ⚙️ **Admin**: https://seu-dominio.vercel.app/admin

### Desenvolvimento
- 🏠 **Local**: http://localhost:3000
- ⚙️ **Admin**: http://localhost:3000/admin

## 🔄 CI/CD Automático

O Vercel automaticamente:

- ✅ Faz deploy a cada push na branch `main`
- ✅ Cria preview para PRs
- ✅ Executa builds otimizados
- ✅ Invalida cache quando necessário

## 📞 Suporte

Para dúvidas:

1. [Documentação Vercel](https://vercel.com/docs)
2. [Suporte Vercel](https://vercel.com/support)
3. [Comunidade Next.js](https://nextjs.org/docs)

---

**✅ Deploy configurado com sucesso!**

Seu Portal Maria Helena está pronto para produção! 🎉