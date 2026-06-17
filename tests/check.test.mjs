import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkParity, loadLocales } from '../src/check.mjs';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function withTempLocales(locales, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'i18n-test-'));
  const files = [];
  for (const [name, data] of Object.entries(locales)) {
    const p = join(dir, `${name}.json`);
    writeFileSync(p, JSON.stringify(data));
    files.push(p);
  }
  try {
    fn(files);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('checkParity', () => {
  it('detects missing keys across locales', () => {
    withTempLocales({
      en: { app: { title: 'Hello', save: 'Save' } },
      fr: { app: { title: 'Bonjour' } },
    }, (files) => {
      const locales = loadLocales(files);
      const { errors } = checkParity(locales);
      assert.equal(errors.length, 1);
      assert.equal(errors[0].key, 'app.save');
      assert.deepEqual(errors[0].missing, ['fr']);
    });
  });

  it('detects empty values', () => {
    withTempLocales({
      en: { greeting: 'Hello' },
      fr: { greeting: '' },
    }, (files) => {
      const locales = loadLocales(files);
      const { warnings } = checkParity(locales);
      assert.equal(warnings.length, 1);
      assert.equal(warnings[0].key, 'greeting');
      assert.equal(warnings[0].locale, 'fr');
    });
  });

  it('reports no errors when locales match', () => {
    withTempLocales({
      en: { a: 'A', b: 'B' },
      fr: { a: 'X', b: 'Y' },
    }, (files) => {
      const locales = loadLocales(files);
      const { errors, warnings } = checkParity(locales);
      assert.equal(errors.length, 0);
      assert.equal(warnings.length, 0);
    });
  });
});
