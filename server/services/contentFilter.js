const piiRegexes = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\+?\d[\d\s\-]{7,}\d/,
];

const offensiveWords = ['fuck','shit','idiot','stupid'];
const handoffKeywords = ['agent','humano','human','representante','person'];

export function checkContent(text = '') {
  const lower = text.toLowerCase();
  if (handoffKeywords.some(k => lower.includes(k))) {
    return { allowed: false, reason: 'handoff', handoff: true };
  }
  if (piiRegexes.some(r => r.test(text))) {
    return { allowed: false, reason: 'pii', handoff: true };
  }
  if (offensiveWords.some(w => lower.includes(w))) {
    return { allowed: false, reason: 'offensive', handoff: true };
  }
  return { allowed: true };
}
