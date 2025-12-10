# 🚀 Guia Completo: Migração de Banco Supabase

Este guia apresenta diferentes métodos para migrar seu banco de dados do Supabase para outra conta.

## 📋 Pré-requisitos

- Acesso à conta Supabase atual (origem)
- Nova conta Supabase criada (destino)
- Projeto criado na nova conta
- Backup dos dados importantes

---

## 🎯 **Método 1: Supabase CLI (RECOMENDADO)**

### 1.1 Instalação do Supabase CLI

```bash
# Via npm
npm install -g supabase

# Via Chocolatey (Windows)
choco install supabase

# Verificar instalação
supabase --version
```

### 1.2 Configuração e Login

```bash
# Login na conta atual
supabase login

# Inicializar projeto local (se não existir)
supabase init

# Linkar com projeto atual
supabase link --project-ref SEU_PROJECT_REF_ATUAL
```

### 1.3 Dump do Banco Atual

```bash
# Fazer dump completo do schema e dados
supabase db dump --file backup_completo.sql

# Dump apenas do schema
supabase db dump --schema-only --file schema_backup.sql

# Dump apenas dos dados
supabase db dump --data-only --file dados_backup.sql
```

### 1.4 Restaurar na Nova Conta

```bash
# Deslinkar do projeto atual
supabase unlink

# Linkar com novo projeto
supabase link --project-ref SEU_NOVO_PROJECT_REF

# Restaurar o backup
supabase db reset --file backup_completo.sql

# Ou aplicar via psql
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < backup_completo.sql
```

---

## 🔧 **Método 2: Export/Import Manual via SQL**

### 2.1 Exportar Schema e Dados

1. **Via Dashboard Supabase:**
   - Vá para SQL Editor
   - Execute: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
   - Copie estrutura das tabelas

2. **Via SQL Editor - Exportar Dados:**
```sql
-- Exportar dados de uma tabela
COPY (SELECT * FROM sua_tabela) TO STDOUT WITH CSV HEADER;

-- Exportar todas as tabelas (executar para cada uma)
COPY empresas TO '/tmp/empresas.csv' WITH CSV HEADER;
COPY noticias TO '/tmp/noticias.csv' WITH CSV HEADER;
```

### 2.2 Importar na Nova Conta

```sql
-- Recriar estrutura das tabelas
-- (usar o schema exportado)

-- Importar dados
COPY empresas FROM '/tmp/empresas.csv' WITH CSV HEADER;
COPY noticias FROM '/tmp/noticias.csv' WITH CSV HEADER;

-- Recriar políticas RLS
-- (copiar das migrações existentes)
```

---

## 🐘 **Método 3: pg_dump/pg_restore**

### 3.1 Obter Strings de Conexão

**Projeto Atual:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF_ATUAL].supabase.co:5432/postgres
```

**Novo Projeto:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF_NOVO].supabase.co:5432/postgres
```

### 3.2 Executar Migração

```bash
# Dump completo
pg_dump "postgresql://postgres:[PASSWORD_ATUAL]@db.[PROJECT_REF_ATUAL].supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists \
  --file=backup_completo.sql

# Restaurar
psql "postgresql://postgres:[PASSWORD_NOVO]@db.[PROJECT_REF_NOVO].supabase.co:5432/postgres" \
  --file=backup_completo.sql

# Ou em uma linha (pipe direto)
pg_dump "postgresql://postgres:[PASSWORD_ATUAL]@db.[PROJECT_REF_ATUAL].supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists | \
psql "postgresql://postgres:[PASSWORD_NOVO]@db.[PROJECT_REF_NOVO].supabase.co:5432/postgres"
```

### 3.3 Opções Específicas

```bash
# Apenas schema
pg_dump --schema-only [CONNECTION_STRING] > schema.sql

# Apenas dados
pg_dump --data-only [CONNECTION_STRING] > dados.sql

# Excluir tabelas específicas
pg_dump --exclude-table=tabela_temporaria [CONNECTION_STRING] > backup.sql

# Dump apenas dos dados
supabase db dump --data-only --file dados_backup.sql
```

### 1.4 Restaurar na Nova Conta

```bash
# Deslinkar do projeto atual
supabase unlink

# Linkar com novo projeto
supabase link --project-ref SEU_NOVO_PROJECT_REF

# Restaurar o backup
supabase db reset --file backup_completo.sql

# Ou aplicar via psql
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < backup_completo.sql
```

---

## 🔧 **Método 2: Export/Import Manual via SQL**

### 2.1 Exportar Schema e Dados

1. **Via Dashboard Supabase:**
   - Vá para SQL Editor
   - Execute: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
   - Copie estrutura das tabelas

2. **Via SQL Editor - Exportar Dados:**
```sql
-- Exportar dados de uma tabela
COPY (SELECT * FROM sua_tabela) TO STDOUT WITH CSV HEADER;

-- Exportar todas as tabelas (executar para cada uma)
COPY empresas TO '/tmp/empresas.csv' WITH CSV HEADER;
COPY noticias TO '/tmp/noticias.csv' WITH CSV HEADER;
```

### 2.2 Importar na Nova Conta

```sql
-- Recriar estrutura das tabelas
-- (usar o schema exportado)

-- Importar dados
COPY empresas FROM '/tmp/empresas.csv' WITH CSV HEADER;
COPY noticias FROM '/tmp/noticias.csv' WITH CSV HEADER;

-- Recriar políticas RLS
-- (copiar das migrações existentes)
```

---

## 🐘 **Método 3: pg_dump/pg_restore**

### 3.1 Obter Strings de Conexão

**Projeto Atual:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF_ATUAL].supabase.co:5432/postgres
```

**Novo Projeto:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF_NOVO].supabase.co:5432/postgres
```

### 3.2 Executar Migração

```bash
# Dump completo
pg_dump "postgresql://postgres:[PASSWORD_ATUAL]@db.[PROJECT_REF_ATUAL].supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists \
  --file=backup_completo.sql

# Restaurar
psql "postgresql://postgres:[PASSWORD_NOVO]@db.[PROJECT_REF_NOVO].supabase.co:5432/postgres" \
  --file=backup_completo.sql

# Ou em uma linha (pipe direto)
pg_dump "postgresql://postgres:[PASSWORD_ATUAL]@db.[PROJECT_REF_ATUAL].supabase.co:5432/postgres" \
  --no-owner --no-privileges --clean --if-exists | \
psql "postgresql://postgres:[PASSWORD_NOVO]@db.[PROJECT_REF_NOVO].supabase.co:5432/postgres"
```

### 3.3 Opções Específicas

```bash
# Apenas schema
pg_dump --schema-only [CONNECTION_STRING] > schema.sql

# Apenas dados
pg_dump --data-only [CONNECTION_STRING] > dados.sql

# Excluir tabelas específicas
pg_dump --exclude-table=tabela_temporaria [CONNECTION_STRING] > backup.sql
```

---

## 📁 **Método 4: Migração de Storage/Buckets**

### 4.1 Listar Buckets Atuais

```sql
-- Via SQL Editor
SELECT * FROM storage.buckets;
```

### 4.2 Recriar Buckets na Nova Conta

```sql
-- Criar buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('empresas', 'empresas', true),
  ('noticias', 'noticias', true),
  ('classificados', 'classificados', true);

-- Recriar políticas de storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 4.3 Migrar Arquivos

```javascript
// Script Node.js para migrar arquivos
const { createClient } = require('@supabase/supabase-js');

const supabaseAntigo = createClient(URL_ANTIGO, ANON_KEY_ANTIGO);
const supabaseNovo = createClient(URL_NOVO, ANON_KEY_NOVO);

async function migrarArquivos() {
  // Listar arquivos do bucket antigo
  const { data: arquivos } = await supabaseAntigo.storage
    .from('empresas')
    .list();

  for (const arquivo of arquivos) {
    // Baixar arquivo
    const { data: blob } = await supabaseAntigo.storage
      .from('empresas')
      .download(arquivo.name);

    // Upload no novo bucket
    await supabaseNovo.storage
      .from('empresas')
      .upload(arquivo.name, blob);
  }
}
```

---

## ✅ **Checklist Pós-Migração**

### 5.1 Atualizar Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[NOVO_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NOVA_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NOVA_SERVICE_KEY]
```

### 5.2 Verificações Essenciais

- [ ] **Tabelas:** Todas as tabelas foram migradas
- [ ] **Dados:** Contagem de registros confere
- [ ] **RLS:** Políticas de segurança ativas
- [ ] **Storage:** Buckets e arquivos migrados
- [ ] **Auth:** Configurações de autenticação
- [ ] **Functions:** Edge Functions (se houver)
- [ ] **Webhooks:** URLs atualizadas

### 5.3 Testes de Funcionalidade

```bash
# Testar build local
npm run build

# Testar conexão com banco
npm run dev
```

### 5.4 Comandos de Verificação

```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar contagem de registros
SELECT 
  schemaname,
  tablename,
  n_tup_ins as "Total Rows"
FROM pg_stat_user_tables;

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar storage
SELECT * FROM storage.buckets;
```

---

## 🚨 **Dicas Importantes**

### ⚠️ **Cuidados Especiais**

1. **Backup Completo:** Sempre faça backup antes de iniciar
2. **Teste Local:** Teste a migração em ambiente de desenvolvimento
3. **RLS Policies:** Verifique se todas as políticas foram migradas
4. **Sequences:** PostgreSQL sequences podem precisar de ajuste
5. **Extensions:** Verifique se extensões estão habilitadas

### 🔄 **Ordem Recomendada**

1. Criar novo projeto Supabase
2. Migrar schema (estrutura)
3. Migrar dados
4. Migrar storage/buckets
5. Atualizar variáveis de ambiente
6. Testar funcionalidades
7. Atualizar DNS/domínio (se aplicável)

### 📞 **Suporte**

- **Documentação:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **GitHub:** https://github.com/supabase/supabase

---

## 🎯 **Para Seu Projeto Específico**

Baseado na estrutura do seu projeto, recomendo:

1. **Use o Método 1 (CLI)** - mais confiável
2. **Suas migrações estão em:** `supabase/migrations/`
3. **Execute as migrações na ordem correta**
4. **Verifique especialmente:** RLS policies, storage buckets
5. **Teste:** Sistema de importação, autenticação, upload de imagens

```bash
# Comando específico para seu projeto
supabase db dump --file guia-comercio-backup.sql
# Depois restaurar na nova conta
```

---

## 📁 **Método 4: Migração de Storage/Buckets**

### 4.1 Listar Buckets Atuais

```sql
-- Via SQL Editor
SELECT * FROM storage.buckets;
```

### 4.2 Recriar Buckets na Nova Conta

```sql
-- Criar buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('empresas', 'empresas', true),
  ('noticias', 'noticias', true),
  ('classificados', 'classificados', true);

-- Recriar políticas de storage
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 4.3 Migrar Arquivos

```javascript
// Script Node.js para migrar arquivos
const { createClient } = require('@supabase/supabase-js');

const supabaseAntigo = createClient(URL_ANTIGO, ANON_KEY_ANTIGO);
const supabaseNovo = createClient(URL_NOVO, ANON_KEY_NOVO);

async function migrarArquivos() {
  // Listar arquivos do bucket antigo
  const { data: arquivos } = await supabaseAntigo.storage
    .from('empresas')
    .list();

  for (const arquivo of arquivos) {
    // Baixar arquivo
    const { data: blob } = await supabaseAntigo.storage
      .from('empresas')
      .download(arquivo.name);

    // Upload no novo bucket
    await supabaseNovo.storage
      .from('empresas')
      .upload(arquivo.name, blob);
  }
}
```

---

## ✅ **Checklist Pós-Migração**

### 5.1 Atualizar Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[NOVO_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NOVA_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[NOVA_SERVICE_KEY]
```

### 5.2 Verificações Essenciais

- [ ] **Tabelas:** Todas as tabelas foram migradas
- [ ] **Dados:** Contagem de registros confere
- [ ] **RLS:** Políticas de segurança ativas
- [ ] **Storage:** Buckets e arquivos migrados
- [ ] **Auth:** Configurações de autenticação
- [ ] **Functions:** Edge Functions (se houver)
- [ ] **Webhooks:** URLs atualizadas

### 5.3 Testes de Funcionalidade

```bash
# Testar build local
npm run build

# Testar conexão com banco
npm run dev
```

### 5.4 Comandos de Verificação

```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verificar contagem de registros
SELECT 
  schemaname,
  tablename,
  n_tup_ins as "Total Rows"
FROM pg_stat_user_tables;

-- Verificar RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar storage
SELECT * FROM storage.buckets;
```

---

## 🚨 **Dicas Importantes**

### ⚠️ **Cuidados Especiais**

1. **Backup Completo:** Sempre faça backup antes de iniciar
2. **Teste Local:** Teste a migração em ambiente de desenvolvimento
3. **RLS Policies:** Verifique se todas as políticas foram migradas
4. **Sequences:** PostgreSQL sequences podem precisar de ajuste
5. **Extensions:** Verifique se extensões estão habilitadas

### 🔄 **Ordem Recomendada**

1. Criar novo projeto Supabase
2. Migrar schema (estrutura)
3. Migrar dados
4. Migrar storage/buckets
5. Atualizar variáveis de ambiente
6. Testar funcionalidades
7. Atualizar DNS/domínio (se aplicável)

### 📞 **Suporte**

- **Documentação:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **GitHub:** https://github.com/supabase/supabase

---

## 🎯 **Para Seu Projeto Específico**

Baseado na estrutura do seu projeto, recomendo:

1. **Use o Método 1 (CLI)** - mais confiável
2. **Suas migrações estão em:** `supabase/migrations/`
3. **Execute as migrações na ordem correta**
4. **Verifique especialmente:** RLS policies, storage buckets
5. **Teste:** Sistema de importação, autenticação, upload de imagens

```bash
# Comando específico para seu projeto
supabase db dump --file guia-comercio-backup.sql
# Depois restaurar na nova conta
```