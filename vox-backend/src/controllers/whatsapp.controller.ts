import { Request, Response } from 'express';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'replace_me';
const APP_SECRET = process.env.WHATSAPP_META_APP_SECRET || '';

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(String(challenge));
  }
  return res.sendStatus(403);
};

function verifySignature(rawBody: Buffer, signatureHeader?: string): boolean {
  if (!APP_SECRET) return false;
  if (!signatureHeader) return false;

  const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signatureHeader);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}

export const handleWebhook = (req: Request, res: Response) => {
  const sig = req.header('x-hub-signature-256');
  const raw = (req as any).rawBody as Buffer | undefined;
  if (!raw) {
    console.warn('No rawBody available for signature verification');
    return res.sendStatus(400);
  }

  if (!verifySignature(raw, sig)) {
    console.warn('Invalid signature for incoming webhook');
    return res.sendStatus(403);
  }

  let body: any;
  try {
    body = JSON.parse(raw.toString('utf8'));
  } catch (err) {
    console.warn('Failed to parse webhook body', err);
    return res.sendStatus(400);
  }

  console.log('[WhatsApp Webhook] Received payload:');
  console.log(JSON.stringify(body, null, 2));

  return res.status(200).json({ status: 'received' });
};

