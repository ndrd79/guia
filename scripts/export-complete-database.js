#!/usr/bin/env node
/**
 * export-complete-database.js
 *
 * Script para exportar informações completas do banco PostgreSQL (Supabase):
 * - Schemas, tabelas, colunas, índices e constraints
 * - Políticas RLS (Row Level Security)
 * - Configurações de storage buckets (schema storage)
 * - Triggers, funções e views
 *
 * Gera um arquivo SQL consolidado com DDL para recriar os objetos
 * e inclui uma seção de comandos de verificação.
 *
 * Uso:
 *   node export-complete-database.js --url "postgresql://..." --out exports/export.sql --schemas public,storage
 *   Ou configure as variáveis: SUPABASE_DIRECT_URL ou DATABASE_URL
 *
 * Opções:
 *   --url       String de conexão do Postgres (prioridade máxima)
 *   --out       Caminho do arquivo SQL de saída (padrão: exports/database-export.sql)
 *   --schemas   Lista de schemas a exportar, separados por vírgula (padrão: public,storage)
 *   --help      Exibe ajuda
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Carrega dotenv se disponível
try { require('dotenv').config(); } catch {}

// Parse simples de argumentos
function parseArgs() {
  const args = process.argv.slice(2);
  const out = { url: null, out: null, schemas: null, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--url') out.url = args[++i];
    else if (a.startsWith('--url=')) out.url = a.split('=')[1];
    else if (a === '--out') out.out = args[++i];
    else if (a.startsWith('--out=')) out.out = a.split('=')[1];
    else if (a === '--schemas') out.schemas = args[++i];
    else if (a.startsWith('--schemas=')) out.schemas = a.split('=')[1];
  }
  return out;
}

function printHelp() {
  console.log(`\nExportador completo do banco (PostgreSQL/Supabase)\n\nUso:\n  node export-complete-database.js --url "postgresql://user:pass@host:port/db" --out exports/export.sql --schemas public,storage\n\nAlternativas:\n  - Configure SUPABASE_DIRECT_URL ou DATABASE_URL em .env.local\n\nOpções:\n  --url       Conexão do Postgres (prioridade sobre env)\n  --out       Caminho do arquivo SQL gerado (default exports/database-export.sql)\n  --schemas   Schemas alvo, separados por vírgula (default public,storage)\n  --help      Mostrar ajuda\n`);
}

function qIdent(name) {
  if (!name) return '""';
  return '"' + String(name).replace(/"/g, '""') + '"';
}

function qLit(value) {
  if (value === null || value === undefined) return 'NULL';
  return "'" + String(value).replace(/'/g, "''") + "'";
}

async function main() {
  const args = parseArgs();
  if (args.help) { printHelp(); process.exit(0); }

  const connectionString = args.url || process.env.SUPABASE_DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Nenhuma string de conexão informada. Use --url ou configure SUPABASE_DIRECT_URL/DATABASE_URL.');
    process.exit(1);
  }

  const outPath = args.out || path.join(process.cwd(), 'exports', 'database-export.sql');
  const schemas = (args.schemas || 'public,storage')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Garante diretório de saída
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const client = new Client({ connectionString });
  console.log('🔌 Conectando ao banco...');
  await client.connect();
  console.log('✅ Conexão estabelecida.');

  let sql = '';
  const now = new Date();
  sql += `-- Export gerado em ${now.toISOString()}\n`;
  sql += `-- Fonte: ${connectionString.replace(/:[^:@/]+@/, ':***@')}\n`;
  sql += `\nBEGIN;\n\n`;

  // Export schemas
  for (const schema of schemas) {
    sql += `-- Schema ${schema}\nCREATE SCHEMA IF NOT EXISTS ${qIdent(schema)};\n\n`;
  }

  // Coleta tabelas
  const tablesRes = await client.query(
    `select table_schema, table_name
     from information_schema.tables
     where table_type='BASE TABLE'
       and table_schema = any($1::text[])`
    , [schemas]
  );

  for (const t of tablesRes.rows) {
    const schema = t.table_schema; const table = t.table_name;
    sql += `-- Tabela ${schema}.${table}\n`;

    // Colunas
    const colsRes = await client.query(
      `select column_name, data_type, is_nullable, column_default,
              character_maximum_length, numeric_precision, numeric_scale, udt_name
       from information_schema.columns
       where table_schema=$1 and table_name=$2
       order by ordinal_position`, [schema, table]
    );

    const colDefs = colsRes.rows.map(c => {
      let type = c.data_type;
      if (type === 'USER-DEFINED') type = c.udt_name;
      if (type === 'character varying' && c.character_maximum_length)
        type = `varchar(${c.character_maximum_length})`;
      if (type === 'numeric') {
        if (c.numeric_precision && c.numeric_scale !== null)
          type = `numeric(${c.numeric_precision},${c.numeric_scale})`;
      }
      const notNull = c.is_nullable === 'NO' ? ' NOT NULL' : '';
      const def = c.column_default ? ` DEFAULT ${c.column_default}` : '';
      return `  ${qIdent(c.column_name)} ${type}${def}${notNull}`;
    }).join(',\n');

    sql += `CREATE TABLE IF NOT EXISTS ${qIdent(schema)}.${qIdent(table)} (\n${colDefs}\n);\n\n`;

    // Constraints
    const consRes = await client.query(
      `select c.conname, c.contype, pg_get_constraintdef(c.oid) as def
       from pg_constraint c
       join pg_class cl on c.conrelid = cl.oid
       join pg_namespace n on n.oid = cl.relnamespace
       where n.nspname=$1 and cl.relname=$2`, [schema, table]
    );
    for (const c of consRes.rows) {
      sql += `ALTER TABLE ${qIdent(schema)}.${qIdent(table)} ADD CONSTRAINT ${qIdent(c.conname)} ${c.def};\n`;
    }
    if (consRes.rows.length) sql += `\n`;

    // Índices
    const idxRes = await client.query(
      `select indexname, indexdef from pg_indexes where schemaname=$1 and tablename=$2`,
      [schema, table]
    );
    for (const i of idxRes.rows) { sql += `${i.indexdef};\n`; }
    if (idxRes.rows.length) sql += `\n`;

    // RLS status
    const rlsRes = await client.query(
      `select c.relrowsecurity, c.relforcerowsecurity
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname=$1 and c.relname=$2`, [schema, table]
    );
    if (rlsRes.rows.length) {
      const r = rlsRes.rows[0];
      if (r.relrowsecurity) sql += `ALTER TABLE ${qIdent(schema)}.${qIdent(table)} ENABLE ROW LEVEL SECURITY;\n`;
      else sql += `ALTER TABLE ${qIdent(schema)}.${qIdent(table)} DISABLE ROW LEVEL SECURITY;\n`;
      if (r.relforcerowsecurity) sql += `ALTER TABLE ${qIdent(schema)}.${qIdent(table)} FORCE ROW LEVEL SECURITY;\n`;
      sql += `\n`;
    }

    // Policies
    const polRes = await client.query(
      `select policyname, permissive, roles, cmd, qual, with_check
       from pg_policies where schemaname=$1 and tablename=$2`, [schema, table]
    );
    for (const p of polRes.rows) {
      const asMode = p.permissive ? 'AS PERMISSIVE' : 'AS RESTRICTIVE';
      const roles = (p.roles && p.roles.length) ? p.roles.map(r => r).join(', ') : 'public';
      const using = p.qual ? ` USING (${p.qual})` : '';
      const withCheck = p.with_check ? ` WITH CHECK (${p.with_check})` : '';
      sql += `CREATE POLICY ${qIdent(p.policyname)} ON ${qIdent(schema)}.${qIdent(table)} ${asMode} FOR ${p.cmd} TO ${roles}${using}${withCheck};\n`;
    }
    if (polRes.rows.length) sql += `\n`;

    // Triggers
    const trgRes = await client.query(
      `select t.tgname, pg_get_triggerdef(t.oid) as def
       from pg_trigger t
       join pg_class c on t.tgrelid = c.oid
       join pg_namespace n on c.relnamespace = n.oid
       where n.nspname=$1 and c.relname=$2 and not t.tgisinternal`, [schema, table]
    );
    for (const tg of trgRes.rows) { sql += `${tg.def};\n`; }
    if (trgRes.rows.length) sql += `\n`;
  }

  // Views
  const viewsRes = await client.query(
    `select table_schema, table_name
     from information_schema.views
     where table_schema = any($1::text[])`, [schemas]
  );
  for (const v of viewsRes.rows) {
    const defRes = await client.query(
      `select pg_get_viewdef(quote_ident($1)||'.'||quote_ident($2)::regclass, true) as def`,
      [v.table_schema, v.table_name]
    );
    const def = defRes.rows[0]?.def || '';
    sql += `-- View ${v.table_schema}.${v.table_name}\nCREATE OR REPLACE VIEW ${qIdent(v.table_schema)}.${qIdent(v.table_name)} AS\n${def};\n\n`;
  }

  // Funções
  const funcsRes = await client.query(
    `select n.nspname as schema, p.proname as name, p.oid
     from pg_proc p join pg_namespace n on p.pronamespace=n.oid
     where n.nspname = any($1::text[])`, [schemas]
  );
  for (const f of funcsRes.rows) {
    const defRes = await client.query(`select pg_get_functiondef($1::oid) as def`, [f.oid]);
    const def = defRes.rows[0]?.def || '';
    sql += `-- Function ${f.schema}.${f.name}\n${def};\n\n`;
  }

  // Storage buckets (schema storage)
  if (schemas.includes('storage')) {
    try {
      const bRes = await client.query(
        `select id, name, public, file_size_limit, allowed_mime_types, owner, created_at, updated_at
         from storage.buckets order by name`
      );
      if (bRes.rows.length) {
        sql += `-- Buckets do Supabase Storage\n`;
        for (const b of bRes.rows) {
          const cols = [
            'id','name','public','file_size_limit','allowed_mime_types','owner','created_at','updated_at'
          ].map(c => qIdent(c)).join(', ');
          const vals = [
            qLit(b.id), qLit(b.name), b.public ? 'true' : 'false',
            b.file_size_limit != null ? String(b.file_size_limit) : 'NULL',
            b.allowed_mime_types ? qLit(b.allowed_mime_types) : 'NULL',
            b.owner ? qLit(b.owner) : 'NULL',
            b.created_at ? qLit(b.created_at) : 'NOW()',
            b.updated_at ? qLit(b.updated_at) : 'NOW()'
          ].join(', ');
          sql += `INSERT INTO storage.buckets (${cols}) VALUES (${vals})\nON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, public=EXCLUDED.public, file_size_limit=EXCLUDED.file_size_limit, allowed_mime_types=EXCLUDED.allowed_mime_types, owner=EXCLUDED.owner, updated_at=EXCLUDED.updated_at;\n`;
        }
        sql += `\n`;
      }
    } catch (err) {
      sql += `-- Aviso: não foi possível consultar storage.buckets (${err.message})\n\n`;
    }
  }

  // Seção de verificação
  sql += `-- ===============================\n`;
  sql += `-- Comandos de Verificação\n`;
  sql += `-- ===============================\n`;
  sql += `-- Tabelas por schema\n`;
  sql += `-- select table_schema, count(*) from information_schema.tables where table_type='BASE TABLE' group by 1 order by 1;\n`;
  sql += `-- Políticas RLS por tabela\n`;
  sql += `-- select schemaname, tablename, count(*) from pg_policies group by 1,2 order by 1,2;\n`;
  sql += `-- Buckets\n`;
  sql += `-- select id, name, public from storage.buckets order by name;\n`;
  sql += `\nCOMMIT;\n`;

  // Escreve arquivo
  fs.writeFileSync(outPath, sql, 'utf8');
  console.log(`📦 Export concluído. Arquivo gerado: ${outPath}`);

  await client.end();
}

main().catch(err => { console.error('❌ Erro na exportação:', err); process.exit(1); });