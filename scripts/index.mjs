/**
 * Scripts de operação do projeto Poker Analyzer.
 * Execute via: npm run scripts:<nome> ou node scripts/<arquivo>.mjs
 */

import { spawnSync } from 'node:child_process';

const [, , command] = process.argv;

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  process.exit(result.status ?? 1);
}

switch (command) {
  case 'bootstrap':
    // Instala dependências de todos os workspaces
    run('npm', ['install']);
    break;
  case 'setup-db':
    // Gera o Prisma Client e aplica migrations
    run('npm', ['run', 'db:generate', '-w', 'backend']);
    run('npm', ['run', 'db:migrate', '-w', 'backend']);
    run('npm', ['run', 'db:seed', '-w', 'backend']);
    break;
  case 'check':
    // Verificação completa de tipos e lint
    run('npm', ['run', 'typecheck']);
    run('npm', ['run', 'lint']);
    break;
  default:
    console.log(`
Comandos disponíveis:
  bootstrap  - instala dependências
  setup-db   - gera Prisma, aplica migrations e seed
  check      - typecheck + lint
`);
}
