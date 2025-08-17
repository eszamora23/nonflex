const limits = new Map();

export function check(conversationId, limit = 20, windowMs = 60_000) {
  if (!conversationId) return true;
  const now = Date.now();
  let entry = limits.get(conversationId);
  if (!entry || entry.expires <= now) {
    entry = { count: 0, expires: now + windowMs };
    limits.set(conversationId, entry);
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export default { check };
