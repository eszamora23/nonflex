import crypto from 'crypto';

let redisClient;
let redisAvailable = false;

try {
  const { createClient } = await import('redis');
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient
    .connect()
    .then(() => {
      redisAvailable = true;
    })
    .catch(() => {
      redisAvailable = false;
    });
} catch (err) {
  redisClient = null;
}

const memoryLocks = new Map();

async function lock(key, ttl = 30000) {
  const token = crypto.randomUUID();

  if (redisClient && redisAvailable) {
    const result = await redisClient.set(key, token, { NX: true, PX: ttl });
    if (result === 'OK') {
      return token;
    }
    return null;
  }

  const now = Date.now();
  const current = memoryLocks.get(key);
  if (current && current.expire > now) {
    return null;
  }

  memoryLocks.set(key, { token, expire: now + ttl });
  return token;
}

async function unlock(key, token) {
  if (redisClient && redisAvailable) {
    const value = await redisClient.get(key);
    if (value === token) {
      await redisClient.del(key);
    }
    return;
  }

  const current = memoryLocks.get(key);
  if (current && current.token === token) {
    memoryLocks.delete(key);
  }
}

export { lock, unlock };
