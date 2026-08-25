import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY!,
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
  workerIntervalMs: parseInt(process.env.WORKER_INTERVAL_MS ?? '60000', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES ?? '3', 10),
  messageDelayMs: parseInt(process.env.MESSAGE_DELAY_MS ?? '2000', 10),
};
