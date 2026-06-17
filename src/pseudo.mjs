// Pseudo-localization generator.
// Transforms English locale JSON: accents Latin letters, expands ~40%, wraps in brackets.
// Preserves interpolation tokens ({{name}}, {count, plural, ...}) untouched.

const ACCENT_MAP = {
  a: 'å', b: 'ƀ', c: 'ç', d: 'ð', e: 'é', f: 'ƒ', g: 'ğ', h: 'ĥ',
  i: 'î', j: 'ĵ', k: 'ķ', l: 'ĺ', m: 'ɱ', n: 'ñ', o: 'ö', p: 'þ',
  q: 'ǫ', r: 'ř', s: 'š', t: 'ţ', u: 'û', v: 'ṽ', w: 'ŵ', x: 'ẋ',
  y: 'ý', z: 'ž',
  A: 'Å', B: 'Ɓ', C: 'Ç', D: 'Ð', E: 'É', F: 'Ƒ', G: 'Ğ', H: 'Ĥ',
  I: 'Î', J: 'Ĵ', K: 'Ķ', L: 'Ĺ', M: 'Ṁ', N: 'Ñ', O: 'Ö', P: 'Þ',
  Q: 'Ǫ', R: 'Ř', S: 'Š', T: 'Ţ', U: 'Û', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ',
  Y: 'Ý', Z: 'Ž',
};

export function pseudoTransform(value) {
  let result = '';
  let i = 0;
  while (i < value.length) {
    if (value[i] === '{') {
      let depth = 0;
      const start = i;
      do {
        if (value[i] === '{') depth++;
        else if (value[i] === '}') depth--;
        i++;
      } while (i < value.length && depth > 0);
      result += value.substring(start, i);
    } else {
      const ch = value[i];
      result += ACCENT_MAP[ch] || ch;
      i++;
    }
  }
  const pad = Math.ceil(result.length * 0.4);
  return `[ ${result} ${'›'.repeat(pad)} ]`;
}

export function transformObj(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      out[key] = transformObj(value);
    } else if (typeof value === 'string') {
      out[key] = pseudoTransform(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
