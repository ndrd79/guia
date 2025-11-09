#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd, input) {
  try {
    return execSync(cmd, { input, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' });
  } catch (e) {
    throw new Error(e.stderr?.toString() || e.stdout?.toString() || e.message);
  }
}

function main() {
  const project = process.env.VERCEL_PROJECT || process.argv[2];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.argv[3] || 'https://portalmariahelena.com.br';
  const emailFrom = process.env.EMAIL_FROM || process.argv[4] || 'noreply@portalmariahelena.com.br';

  if (!project) {
    console.error('Uso: node configure-vercel-env.js <projectName> [siteUrl] [emailFrom]');
    process.exit(1);
  }

  console.log(`Configuração Vercel para projeto: ${project}`);
  try {
    // Linkar diretório ao projeto do Vercel (se necessário)
    try {
      run(`vercel link --project ${project} --yes`);
      console.log('Projeto linkado com sucesso.');
    } catch (e) {
      console.log('Aviso: não foi possível linkar automaticamente (pode já estar linkado).');
    }

    console.log('Definindo NEXT_PUBLIC_SITE_URL (production)...');
    run('vercel env add NEXT_PUBLIC_SITE_URL production', siteUrl + '\n');

    console.log('Definindo EMAIL_FROM (production)...');
    run('vercel env add EMAIL_FROM production', emailFrom + '\n');

    console.log('✅ Variáveis configuradas. Faça redeploy para aplicar.');
  } catch (err) {
    console.error('❌ Erro ao configurar variáveis no Vercel:', err.message);
    process.exit(1);
  }
}

main();