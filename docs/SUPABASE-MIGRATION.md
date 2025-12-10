# 🚀 Migração do Banco de Dados - Tabela Banners

## ❗ Problema Identificado

O erro `relation "public.banners" does not exist` indica que a tabela `banners` não foi criada no banco de dados Supabase.

## 📋 Solução - Execute a Migração

### Passo 1: Acessar o Supabase Dashboard
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto do Portal Maria Helena

### Passo 2: Abrir o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"** para criar uma nova consulta

### Passo 3: Executar o Script de Migração
1. Copie todo o conteúdo do arquivo `migrations/create_banners_table.sql`
2. Cole no editor SQL do Supabase
3. Clique em **"Run"** para executar o script

### Passo 4: Verificar a Criação
Após executar o script, você deve ver:
- ✅ Tabela `banners` criada com sucesso
- ✅ Índices criados para performance
- ✅ Políticas de segurança (RLS) configuradas
- ✅ 3 banners de exemplo inseridos
- ✅ Trigger para atualização automática de `updated_at`

## 🔍 Verificação

Para confirmar que tudo funcionou:

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'banners';

-- Verificar banners inseridos
SELECT * FROM banners;
```

## 🎯 Estrutura da Tabela Banners

| Campo | Tipo | Descrição |
|-------|------|----------|
| `id` | UUID | Chave primária (auto-gerada) |
| `nome` | VARCHAR(255) | Nome identificador do banner |
| `posicao` | VARCHAR(100) | Posição onde será exibido |
| `imagem` | TEXT | URL da imagem do banner |
| `link` | TEXT | URL de redirecionamento (opcional) |
| `largura` | INTEGER | Largura em pixels (padrão: 400) |
| `altura` | INTEGER | Altura em pixels (padrão: 200) |
| `ativo` | BOOLEAN | Se o banner está ativo (padrão: true) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

## 🔐 Políticas de Segurança

- **Leitura Pública**: Banners ativos são visíveis para todos
- **Gerenciamento**: Apenas usuários autenticados podem criar/editar/excluir

## 🚨 Troubleshooting

### Se o erro persistir:
1. Verifique se você está conectado ao projeto correto
2. Confirme se as variáveis de ambiente estão corretas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Se houver erro de permissão:
1. Verifique se você tem permissões de administrador no projeto
2. Confirme se o RLS está configurado corretamente

## ✅ Após a Migração

Depois de executar a migração com sucesso:
1. Recarregue a página do painel administrativo
2. Acesse `/admin/banners`
3. Você deve ver os 3 banners de exemplo
4. Teste criar um novo banner
5. Verifique se os banners aparecem no site

## 📞 Suporte

Se continuar com problemas:
1. Verifique os logs do console do navegador
2. Confirme a conexão com o Supabase
3. Execute novamente o script de migração
4. Reinicie o servidor de desenvolvimento (`npm run dev`)