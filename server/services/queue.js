import crypto from 'crypto';

let redisClient = null;
let redisAvailable = false;
const memoryLocks = new Map();

async function ensureRedis() {
  if (redisClient !== null) return;
  if (!process.env.REDIS_URL) { redisClient = null; redisAvailable = false; return; }
  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
    redisClient = client;
    redisAvailable = true;
  } catch {
    redisClient = null;
    redisAvailable = false;
  }
}

export async function lock(key, ttl = 30000) {
  await ensureRedis();
  const token = crypto.randomUUID();

  if (redisClient && redisAvailable) {
    const result = await redisClient.set(key, token, { NX: true, PX: ttl });
    return result === 'OK' ? token : null;
  }

  const now = Date.now();
  const current = memoryLocks.get(key);
  if (current && current.expire > now) return null;

  memoryLocks.set(key, { token, expire: now + ttl });
  return token;
}

export async function unlock(key, token) {
  await ensureRedis();

  if (redisClient && redisAvailable) {
    const value = await redisClient.get(key);
    if (value === token) await redisClient.del(key);
    return;
  }

  const current = memoryLocks.get(key);
  if (current && current.token === token) memoryLocks.delete(key);
}
