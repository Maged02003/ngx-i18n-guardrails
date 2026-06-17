import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scanTemplate } from '../src/scan.mjs';

describe('scanTemplate', () => {
  it('detects hardcoded text content', () => {
    const html = `<p>This is hardcoded text</p>`;
    const findings = scanTemplate(html);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].text, 'This is hardcoded text');
    assert.equal(findings[0].type, 'text-content');
  });

  it('ignores text using translate pipe', () => {
    const html = `<p>{{ 'app.title' | translate }}</p>`;
    const findings = scanTemplate(html);
    assert.equal(findings.length, 0);
  });

  it('ignores mat-icon content', () => {
    const html = `<mat-icon>close</mat-icon>`;
    const findings = scanTemplate(html);
    assert.equal(findings.length, 0);
  });

  it('detects hardcoded placeholder attributes', () => {
    const html = `<input placeholder="Enter your name" />`;
    const findings = scanTemplate(html);
    assert.equal(findings.length, 1);
    assert.equal(findings[0].type, 'attr:placeholder');
  });

  it('ignores Angular binding attributes', () => {
    const html = `<input [placeholder]="'app.hint' | translate" />`;
    const findings = scanTemplate(html);
    assert.equal(findings.length, 0);
  });

  it('ignores short or non-word strings', () => {
    const html = `<span>-</span><span>42</span>`;
    const findings = scanTemplate(html);
    assert.equal(findings.length, 0);
  });
});
