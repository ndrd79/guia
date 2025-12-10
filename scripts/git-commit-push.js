#!/usr/bin/env node

const { execSync } = require('child_process');

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...options });
  } catch (err) {
    const msg = err.stderr?.toString() || err.stdout?.toString() || err.message;
    throw new Error(msg.trim());
  }
}

function log(step, msg) {
  console.log(`[git] ${step}: ${msg}`);
}

(function main() {
  try {
    // Commit message
    const messageArg = process.argv.slice(2).join(' ').trim();
    const commitMessage = messageArg || process.env.MSG || 'chore: commit automático via script';

    // Verify git repo
    try {
      const inside = run('git rev-parse --is-inside-work-tree').trim();
      if (inside !== 'true') {
        throw new Error('Não estamos dentro de um repositório git.');
      }
    } catch (e) {
      throw new Error('Repositório git não encontrado. Execute "git init" e configure o remoto.');
    }

    // Status
    const status = run('git status --porcelain');
    if (!status.trim()) {
      log('status', 'Nenhuma alteração para commit.');
    } else {
      // Add all
      log('add', 'Adicionando arquivos modificados...');
      run('git add -A');

      // Commit
      log('commit', `Commitando com mensagem: ${commitMessage}`);
      try {
        const commitOut = run(`git commit -m ${JSON.stringify(commitMessage)}`);
        process.stdout.write(commitOut);
      } catch (e) {
        if (/nothing to commit/i.test(e.message)) {
          log('commit', 'Nada para commit (working tree limpa).');
        } else {
          throw e;
        }
      }
    }

    // Detect branch
    let branch = 'main';
    try {
      branch = run('git rev-parse --abbrev-ref HEAD').trim();
    } catch {}

    // Check remote
    let hasOrigin = false;
    try {
      const remotes = run('git remote -v');
      hasOrigin = /\borigin\b/.test(remotes);
      if (!hasOrigin) {
        log('remote', 'Remoto "origin" não está configurado. Configure com:');
        console.log('  git remote add origin <URL_DO_REPOSITORIO>');
        console.log('  git push -u origin ' + branch);
        process.exit(0);
      }
    } catch (e) {
      log('remote', 'Falha ao verificar remotos: ' + e.message);
      process.exit(1);
    }

    // Push
    log('push', `Enviando para origin/${branch}...`);
    const pushOut = run(`git push origin ${branch}`);
    process.stdout.write(pushOut);

    log('done', `Commit e push concluídos para origin/${branch}.`);
  } catch (error) {
    console.error('\n[git] ERRO:', error.message);
    process.exit(1);
  }
})();