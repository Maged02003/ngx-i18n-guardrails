// Shared utilities for locale JSON handling.

export function flatKeys(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys.push(...flatKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

export function getVal(obj, dotPath) {
  return dotPath.split('.').reduce((o, k) => o?.[k], obj);
}
