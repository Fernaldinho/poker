import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed do banco: configurações iniciais e tags padrão.
 * Idempotente - pode rodar múltiplas vezes.
 */
async function main(): Promise<void> {
  const settings: Array<{ key: string; value: unknown; description: string }> = [
    { key: 'app.name', value: { value: 'Poker Analyzer' }, description: 'Nome do aplicativo' },
    { key: 'app.theme', value: { value: 'dark' }, description: 'Tema padrão' },
    { key: 'replayer.speed', value: { value: 1.0 }, description: 'Velocidade padrão do replayer' },
    { key: 'replayer.auto_advance', value: { value: true }, description: 'Avanço automático' },
    {
      key: 'upload.max_size_mb',
      value: { value: 2048 },
      description: 'Tamanho máximo de upload em MB',
    },
    {
      key: 'import.auto_analyze',
      value: { value: true },
      description: 'Analisar automaticamente após importação',
    },
    {
      key: 'dashboard.default_period',
      value: { value: '30d' },
      description: 'Período padrão do dashboard',
    },
  ];

  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  const tags = [
    { name: 'Estudo', color: '#6366F1', type: 'GENERAL' },
    { name: 'Revisar', color: '#F59E0B', type: 'GENERAL' },
    { name: 'Tilt', color: '#EF4444', type: 'GENERAL' },
    { name: 'Bluff', color: '#10B981', type: 'HAND' },
    { name: 'Value', color: '#3B82F6', type: 'HAND' },
    { name: 'Mistake', color: '#EF4444', type: 'HAND' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }

  console.log('[seed] Configurações e tags padrão criadas');
}

main()
  .catch((e) => {
    console.error('[seed] Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
