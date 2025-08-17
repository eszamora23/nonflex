const cache = new Map();

export function get(id) {
  return cache.get(id);
}

export function set(id, data) {
  cache.set(id, data);
}

export default { get, set };
