import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { config } from './config.js';
import { supabase } from './supabase.js';

const logger = pino({ level: config.logLevel });

let sock: WASocket | null = null;
let qrCallback: ((qr: string) => void) | null = null;
let statusCallback: ((status: string) => void) | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

const AUTH_DIR = './auth_info';
const AUTH_STORAGE_KEY = 'whatsapp-auth-creds';

async function loadCredsFromStorage(): Promise<boolean> {
  try {
    const { data } = await supabase.storage.from('whatsapp-auth').download(AUTH_STORAGE_KEY);
    if (!data) return false;

    const text = await data.text();
    const credsDir = join(process.cwd(), AUTH_DIR);
    if (!existsSync(credsDir)) mkdirSync(credsDir, { recursive: true });
    writeFileSync(join(credsDir, 'creds.json'), text);
    return true;
  } catch {
    return false;
  }
}

async function saveCredsToStorage(): Promise<void> {
  try {
    const credsPath = join(process.cwd(), AUTH_DIR, 'creds.json');
    if (!existsSync(credsPath)) return;

    const creds = readFileSync(credsPath, 'utf-8');
    const blob = new Blob([creds], { type: 'application/json' });

    const { error } = await supabase.storage
      .from('whatsapp-auth')
      .upload(AUTH_STORAGE_KEY, blob, { contentType: 'application/json', upsert: true });

    if (error) logger.error({ err: error }, 'Failed to save creds to storage');
    else logger.debug('Credentials saved to Supabase Storage');
  } catch (err) {
    logger.error({ err }, 'Error saving credentials to storage');
  }
}

function onConnectionUpdate({ connection, lastDisconnect, qr }: any) {
  if (qr) {
    logger.info('QR received — scan with WhatsApp');
    qrCallback?.(qr);
  }

  if (connection === 'open') {
    logger.info('WhatsApp connected');
    reconnectAttempts = 0;
    statusCallback?.('CONNECTED');
  }

  if (connection === 'close') {
    const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
    if (code === DisconnectReason.loggedOut) {
      logger.warn('WhatsApp logged out — need fresh QR');
      statusCallback?.('LOGGED_OUT');
    } else if (code === DisconnectReason.connectionReplaced) {
      logger.warn('Another instance took over');
      statusCallback?.('REPLACED');
    } else {
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        logger.error('Max reconnect attempts reached — giving up');
        statusCallback?.('FAILED');
        return;
      }
      const delay = Math.min(3000 * Math.pow(1.5, reconnectAttempts), 60_000);
      reconnectAttempts++;
      logger.info({ attempt: reconnectAttempts, delayMs: delay }, 'Reconnecting...');
      statusCallback?.('RECONNECTING');
      setTimeout(() => startBot(), delay);
    }
  }
}

export async function startBot(): Promise<WASocket> {
  await loadCredsFromStorage();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger,
    browser: ['AppMedica Bot', 'Chrome', '1.0.0'],
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on('connection.update', onConnectionUpdate);
  sock.ev.on('creds.update', () => {
    saveCreds();
    saveCredsToStorage();
  });

  return sock;
}

export function getSocket(): WASocket | null {
  return sock;
}

export function getStatus(): string {
  if (!sock) return 'DISCONNECTED';
  try {
    const ws = (sock as any).ws;
    if (ws && typeof ws.readyState === 'number') {
      return ws.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    }
  } catch {}
  return 'DISCONNECTED';
}

export function onQR(cb: (qr: string) => void) {
  qrCallback = cb;
}

export function onStatus(cb: (status: string) => void) {
  statusCallback = cb;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `${cleaned}@s.whatsapp.net`;
}

export async function isOnWhatsApp(phone: string): Promise<boolean> {
  if (!sock) return false;
  try {
    const jid = formatPhone(phone);
    const results = await sock.onWhatsApp(jid);
    if (!results || results.length === 0) return false;
    return Boolean(results[0]?.exists);
  } catch {
    return false;
  }
}

export async function sendText(phone: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!sock) return { success: false, error: 'Socket no conectado' };
  try {
    const jid = formatPhone(phone);
    const result = await sock.sendMessage(jid, { text });
    return { success: true, messageId: result?.key?.id ?? undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error al enviar' };
  }
}
