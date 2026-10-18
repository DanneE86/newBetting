// Skickar bästa tipsen till Discord via webhook: npm run discord (--test skriver bara ut meddelandet).
// Webhook-adressen ligger i .env som DISCORD_WEBHOOK_URL (gitignorerad, repot är publikt).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { request } from './lib/http.mjs';
import { topTips, discordMessage } from './lib/discord-tips.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function webhookUrl() {
  if (process.env.DISCORD_WEBHOOK_URL) return process.env.DISCORD_WEBHOOK_URL.trim();
  try {
    const m = /^DISCORD_WEBHOOK_URL\s*=\s*(.+)$/m.exec(fs.readFileSync(path.join(root, '.env'), 'utf8'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  } catch { return null; }
}

const data = JSON.parse(fs.readFileSync(path.join(root, 'data/tips-latest.json'), 'utf8'));
const content = discordMessage(topTips(data), data);
if (process.argv.includes('--test')) {
  console.log(content);
} else {
  const url = webhookUrl();
  if (!url || !/^https:\/\/(?:\w+\.)?discord(?:app)?\.com\/api\/webhooks\//.test(url)) {
    console.error('DISCORD_WEBHOOK_URL saknas eller är ingen Discord-webhook. Lägg in den i .env.');
    process.exit(1);
  }
  await request(url, { as: 'text', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, username: 'Betting-tips' }), label: 'discord' });
  console.log('Skickat till Discord:\n' + content);
}
