import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { Redis } from '@upstash/redis';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ── Session Token Store (in-memory) ──
const activeSessions = new Map();

function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions) {
    if (session.expires < now) activeSessions.delete(token);
  }
}, 60000);

// ── Auth middleware ──
const API_KEY = process.env.API_KEY;
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/auth/login') return next();
  if (req.method === 'GET' && req.path === '/students') return next();
  const token = req.headers['x-session-token'];
  const key = req.headers['x-api-key'];
  if (token) {
    const session = activeSessions.get(token);
    if (session && session.expires > Date.now()) { req.session = session; return next(); }
    return res.status(401).json({ error: 'session expired' });
  }
  if (!API_KEY || key === API_KEY) return next();
  res.status(401).json({ error: 'unauthorized' });
});

// ── Auth Login ──
app.post('/auth/login', async (req, res) => {
  try {
    const { role, password, studentId } = req.body;
    const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
    const TEACHER_PIN = process.env.TEACHER_PIN || '5678';
    if (role === 'admin') {
      if (password !== ADMIN_PIN) return res.status(401).json({ error: 'wrong password' });
    } else if (role === 'teacher') {
      if (password !== TEACHER_PIN) return res.status(401).json({ error: 'wrong password' });
    } else if (role === 'student') {
      const raw = await redis.get('rev_students');
      const data = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
      const student = Object.values(data).find(s => String(s.id) === String(studentId));
      if (!student) return res.status(401).json({ error: 'not found' });
      if (student.pin !== password) return res.status(401).json({ error: 'wrong password' });
    } else {
      return res.status(400).json({ error: 'invalid role' });
    }
    const token = generateToken();
    activeSessions.set(token, { role, studentId: studentId || null, expires: Date.now() + 24 * 60 * 60 * 1000 });
    res.json({ ok: true, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Upstash Redis ──
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ── WebSocket clients map: clientId → ws ──
const clients = new Map();

// ── Broadcast helper ──
function broadcast(event, data, exceptWs = null) {
  const msg = JSON.stringify({ event, data });
  for (const [, ws] of clients) {
    if (ws !== exceptWs && ws.readyState === 1) {
      ws.send(msg);
    }
  }
}

// ── WebSocket connection ──
wss.on('connection', (ws) => {
  const clientId = Date.now() + '_' + Math.random().toString(36).slice(2);
  clients.set(clientId, ws);

  ws.on('close', async () => {
    clients.delete(clientId);
    // ถ้า client ลงทะเบียน studentId ไว้ → ลบ online
    if (ws._studentId) {
      await redis.hdel('rev_online', String(ws._studentId));
      broadcastOnline();
    }
  });

  ws.on('message', async (raw) => {
    try {
      const { type, payload } = JSON.parse(raw);
      if (type === 'ping') {
        // heartbeat: อัปเดต timestamp online
        if (ws._studentId) {
          const entry = await redis.hget('rev_online', String(ws._studentId));
          if (entry) {
            const parsed = typeof entry === 'string' ? JSON.parse(entry) : entry;
            await redis.hset('rev_online', {
              [String(ws._studentId)]: JSON.stringify({ ...parsed, ts: Date.now() })
            });
          }
        }
      } else if (type === 'setOnline') {
        ws._studentId = payload.id;
        await redis.hset('rev_online', {
          [String(payload.id)]: JSON.stringify({ id: payload.id, name: payload.name, ts: Date.now() })
        });
        broadcastOnline();
      } else if (type === 'setOffline') {
        if (ws._studentId) {
          await redis.hdel('rev_online', String(ws._studentId));
          ws._studentId = null;
          broadcastOnline();
        }
      }
    } catch (e) {
      console.error('ws message error:', e.message);
    }
  });
});

async function broadcastOnline() {
  const raw = await redis.hgetall('rev_online') || {};
  const now = Date.now();
  const users = Object.values(raw)
    .map(v => typeof v === 'string' ? JSON.parse(v) : v)
    .filter(u => now - u.ts < 120000);
  broadcast('online', users);
}

// ── Periodically clean stale online users ──
setInterval(async () => {
  try {
    const raw = await redis.hgetall('rev_online') || {};
    const now = Date.now();
    const stale = Object.entries(raw).filter(([, v]) => {
      const u = typeof v === 'string' ? JSON.parse(v) : v;
      return now - u.ts >= 120000;
    });
    for (const [id] of stale) await redis.hdel('rev_online', id);
    if (stale.length > 0) broadcastOnline();
  } catch (e) {}
}, 30000);

// ═══════════════════════════════════════════
//  REST API
// ═══════════════════════════════════════════

// ── Students ──
app.get('/students', async (req, res) => {
  try {
    const raw = await redis.get('rev_students');
    const data = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/students', async (req, res) => {
  try {
    await redis.set('rev_students', JSON.stringify(req.body));
    broadcast('students', req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Settings ──
app.get('/settings', async (req, res) => {
  try {
    const raw = await redis.get('rev_settings');
    const data = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/settings', async (req, res) => {
  try {
    await redis.set('rev_settings', JSON.stringify(req.body));
    broadcast('settings', req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BP Tiers ──
app.get('/bp/tiers', async (req, res) => {
  try {
    const raw = await redis.get('rev_bp_tiers');
    res.json(raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/bp/tiers', async (req, res) => {
  try {
    await redis.set('rev_bp_tiers', JSON.stringify(req.body));
    broadcast('bp_tiers', req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BP Free Rewards ──
app.get('/bp/free-rewards', async (req, res) => {
  try {
    const raw = await redis.get('rev_bp_free_rewards');
    res.json(raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/bp/free-rewards', async (req, res) => {
  try {
    await redis.set('rev_bp_free_rewards', JSON.stringify(req.body));
    broadcast('bp_free_rewards', req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BP Claim Rewards ──
app.get('/bp/claim-rewards', async (req, res) => {
  try {
    const raw = await redis.get('rev_bp_claim_rewards');
    res.json(raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/bp/claim-rewards', async (req, res) => {
  try {
    await redis.set('rev_bp_claim_rewards', JSON.stringify(req.body));
    broadcast('bp_claim_rewards', req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BP Season End ──
app.get('/bp/season-end', async (req, res) => {
  try {
    const raw = await redis.get('rev_bp_season_end');
    res.json({ value: raw });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/bp/season-end', async (req, res) => {
  try {
    await redis.set('rev_bp_season_end', req.body.value);
    broadcast('bp_season_end', req.body.value);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── BP Queue ──
app.get('/bp/queue', async (req, res) => {
  try {
    const raw = await redis.hgetall('rev_bp_queue') || {};
    const parsed = {};
    for (const [k, v] of Object.entries(raw)) {
      parsed[k] = typeof v === 'string' ? JSON.parse(v) : v;
    }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/bp/queue/:key', async (req, res) => {
  try {
    await redis.hset('rev_bp_queue', { [req.params.key]: JSON.stringify(req.body) });
    broadcast('bp_queue_update', null);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/bp/queue/:key/status', async (req, res) => {
  try {
    const raw = await redis.hget('rev_bp_queue', req.params.key);
    if (!raw) return res.status(404).json({ error: 'not found' });
    const item = typeof raw === 'string' ? JSON.parse(raw) : raw;
    item.status = req.body.status;
    await redis.hset('rev_bp_queue', { [req.params.key]: JSON.stringify(item) });
    broadcast('bp_queue_update', null);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/bp/queue/:key', async (req, res) => {
  try {
    await redis.hdel('rev_bp_queue', req.params.key);
    broadcast('bp_queue_update', null);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Shop Items ──
app.get('/shop', async (req, res) => {
  try {
    const raw = await redis.hgetall('rev_shopitems') || {};
    const items = Object.values(raw).map(v => typeof v === 'string' ? JSON.parse(v) : v)
      .sort((a, b) => a.ts - b.ts);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/shop/:id', async (req, res) => {
  try {
    await redis.hset('rev_shopitems', { [req.params.id]: JSON.stringify(req.body) });
    const raw = await redis.hgetall('rev_shopitems') || {};
    const items = Object.values(raw).map(v => typeof v === 'string' ? JSON.parse(v) : v)
      .sort((a, b) => a.ts - b.ts);
    broadcast('shopitems', items);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/shop/:id', async (req, res) => {
  try {
    await redis.hdel('rev_shopitems', req.params.id);
    const raw = await redis.hgetall('rev_shopitems') || {};
    const items = Object.values(raw).map(v => typeof v === 'string' ? JSON.parse(v) : v)
      .sort((a, b) => a.ts - b.ts);
    broadcast('shopitems', items);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Likes ──
app.get('/likes', async (req, res) => {
  try {
    const raw = await redis.hgetall('rev_likes') || {};
    const parsed = {};
    for (const [k, v] of Object.entries(raw)) {
      parsed[k] = typeof v === 'string' ? JSON.parse(v) : v;
    }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/likes/:key', async (req, res) => {
  try {
    const raw = await redis.hget('rev_likes', req.params.key);
    res.json(raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/likes/:key', async (req, res) => {
  try {
    await redis.hset('rev_likes', { [req.params.key]: JSON.stringify(req.body) });
    const raw = await redis.hgetall('rev_likes') || {};
    const parsed = {};
    for (const [k, v] of Object.entries(raw)) parsed[k] = typeof v === 'string' ? JSON.parse(v) : v;
    broadcast('likes', parsed);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/likes/:key', async (req, res) => {
  try {
    await redis.hdel('rev_likes', req.params.key);
    const raw = await redis.hgetall('rev_likes') || {};
    const parsed = {};
    for (const [k, v] of Object.entries(raw)) parsed[k] = typeof v === 'string' ? JSON.parse(v) : v;
    broadcast('likes', parsed);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/likes', async (req, res) => {
  try {
    await redis.del('rev_likes');
    broadcast('likes', {});
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Swipes (reset) ──
app.delete('/swipes', async (req, res) => {
  try {
    await redis.del('rev_swipes');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Chats ──
app.get('/chats/:key', async (req, res) => {
  try {
    const raw = await redis.hgetall('rev_chats_' + req.params.key) || {};
    const parsed = {};
    for (const [k, v] of Object.entries(raw)) parsed[k] = typeof v === 'string' ? JSON.parse(v) : v;
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/chats/:key/:msgId', async (req, res) => {
  try {
    await redis.hset('rev_chats_' + req.params.key, { [req.params.msgId]: JSON.stringify(req.body) });
    const raw = await redis.hgetall('rev_chats_' + req.params.key) || {};
    const parsed = {};
    for (const [k, v] of Object.entries(raw)) parsed[k] = typeof v === 'string' ? JSON.parse(v) : v;
    broadcast('chat_' + req.params.key, parsed);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/chats/:key', async (req, res) => {
  try {
    await redis.del('rev_chats_' + req.params.key);
    await redis.del('rev_chat_meta_' + req.params.key);
    broadcast('chat_meta_' + req.params.key, null); // signal deletion to partner
    broadcast('chat_' + req.params.key, null);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Chat Meta ──
app.get('/chat-meta/:key', async (req, res) => {
  try {
    const raw = await redis.get('rev_chat_meta_' + req.params.key);
    res.json(raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/chat-meta/:key', async (req, res) => {
  try {
    await redis.set('rev_chat_meta_' + req.params.key, JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: reset likes+swipes+chats (clear round) ──
app.post('/admin/reset-round', async (req, res) => {
  try {
    // get all like keys to find chat keys
    await redis.del('rev_likes');
    await redis.del('rev_swipes');
    broadcast('likes', {});
    broadcast('swipes', null);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: delete specific student's chat + likes ──
app.delete('/admin/student/:id/chat', async (req, res) => {
  try {
    await redis.hdel('rev_online', String(req.params.id));
    broadcastOnline();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/admin/student/:id/likes-and-chats', async (req, res) => {
  try {
    const id = String(req.params.id);
    const likesRaw = await redis.hgetall('rev_likes') || {};
    const toDelete = Object.keys(likesRaw).filter(k =>
      k.startsWith(id + '_likes_') || k.endsWith('_likes_' + id)
    );
    for (const k of toDelete) await redis.hdel('rev_likes', k);
    if (toDelete.length) {
      const rem = await redis.hgetall('rev_likes') || {};
      const parsed = {};
      for (const [k, v] of Object.entries(rem)) parsed[k] = typeof v === 'string' ? JSON.parse(v) : v;
      broadcast('likes', parsed);
    }
    await redis.hdel('rev_online', id);
    broadcastOnline();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Health check ──
app.get('/', (req, res) => res.json({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
