import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pseudoTransform, transformObj } from '../src/pseudo.mjs';

describe('pseudoTransform', () => {
  it('accents Latin letters and wraps in brackets', () => {
    const result = pseudoTransform('Save');
    assert.ok(result.startsWith('[ '));
    assert.ok(result.endsWith(' ]'));
    assert.ok(!result.includes('Save'));
    assert.ok(result.includes('Šåṽé'));
  });

  it('preserves {{interpolation}} tokens', () => {
    const result = pseudoTransform('Hello, {{name}}!');
    assert.ok(result.includes('{{name}}'));
    assert.ok(!result.includes('{{ñåɱé}}'));
  });

  it('preserves ICU plural tokens', () => {
    const input = '{count, plural, =0 {No items} =1 {One item} other {{{count}} items}}';
    const result = pseudoTransform(input);
    assert.ok(result.includes(input));
  });

  it('preserves ICU select tokens', () => {
    const input = "Value '{{value}}' is not allowed{allowed, select, undefined {} other { (allowed: {{allowed}})}}";
    const result = pseudoTransform(input);
    assert.ok(result.includes('{{value}}'));
    assert.ok(result.includes('{allowed, select, undefined {} other { (allowed: {{allowed}})}}'));
  });

  it('expands text by ~40%', () => {
    const input = 'Hello World';
    const result = pseudoTransform(input);
    assert.ok(result.length > input.length * 1.3);
  });
});

describe('transformObj', () => {
  it('transforms all string values recursively', () => {
    const input = { a: { b: 'Hello' }, c: 'World' };
    const result = transformObj(input);
    assert.ok(result.a.b.startsWith('[ '));
    assert.ok(result.c.startsWith('[ '));
    assert.ok(!result.a.b.includes('Hello'));
    assert.ok(!result.c.includes('World'));
  });

  it('preserves non-string values', () => {
    const input = { count: 42, flag: true, nested: { val: 'text' } };
    const result = transformObj(input);
    assert.equal(result.count, 42);
    assert.equal(result.flag, true);
    assert.ok(result.nested.val.startsWith('[ '));
  });
});
