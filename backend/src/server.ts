import { startServer } from './app';

// BigInt não é serializável por JSON.stringify (usado por res.json).
// Converte para Number para evitar crashes (ex: sizeBytes).
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return Number(this);
};

// Erros async não tratados derrubam o processo no Node 24+.
// Logamos em vez de derrubar; o middleware de erro responde ao request.
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
});

startServer().catch((error) => {
  console.error('[server] Falha ao iniciar:', error);
  process.exit(1);
});
