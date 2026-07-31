import { startServer } from './app';

startServer().catch((error) => {
  console.error('[server] Falha ao iniciar:', error);
  process.exit(1);
});
