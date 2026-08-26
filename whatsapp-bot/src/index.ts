import { createServer, type Server } from 'http';
import { config } from './config.js';
import { startBot, onQR, onStatus, getStatus } from './wa.js';
import { startWorker, stopWorker } from './worker.js';

let currentQR = '';
let currentStatus = 'DISCONNECTED';
let server: Server | null = null;

onQR((qr) => {
  currentQR = qr;
  currentStatus = 'WAITING_QR';
});

onStatus((status) => {
  currentStatus = status;
  if (status === 'CONNECTED') currentQR = '';
});

function setCorsHeaders(res: import('http').ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const serverHandler = (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    const connected = getStatus() === 'CONNECTED';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: currentStatus,
      connected,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  if (req.url === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(currentQR || 'No QR disponible — el bot está conectado o esperando...');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
};

async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 ${signal} received — shutting down gracefully...`);

  stopWorker();

  if (server) {
    server.close(() => {
      console.log('🌐 HTTP server closed');
    });
  }

  console.log('👋 Goodbye');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

async function main() {
  console.log('🚀 Iniciando WhatsApp Bot para Clinica Proyecto...');
  console.log(`📌 Environment: ${config.nodeEnv}`);
  console.log(`📌 Log level: ${config.logLevel}`);
  console.log(`📌 Worker interval: ${config.workerIntervalMs / 1000}s`);
  console.log(`📌 Message delay: ${config.messageDelayMs}ms`);
  console.log('');

  await startBot();

  startWorker();

  server = createServer(serverHandler);
  server.listen(config.port, () => {
    console.log(`\n🌐 Health check: http://localhost:${config.port}/health`);
    console.log(`📱 QR endpoint: http://localhost:${config.port}/qr\n`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
