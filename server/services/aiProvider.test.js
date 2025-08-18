import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateReply } from './aiProvider.js';
import { checkContent } from './contentFilter.js';

test('contentFilter forces handoff on reembolso', () => {
  const res = checkContent('Necesito un reembolso');
  assert.equal(res.allowed, false);
  assert.equal(res.handoff, true);
});

test('contentFilter forces handoff on queja', () => {
  const res = checkContent('Tengo una queja');
  assert.equal(res.allowed, false);
  assert.equal(res.handoff, true);
});

test('generateReply disables AI on reembolso', async () => {
  const res = await generateReply({ userMsg: 'Necesito un reembolso' });
  assert.equal(res.handoff, true);
  assert.equal(res.reply, '');
});

test('generateReply disables AI on queja', async () => {
  const res = await generateReply({ userMsg: 'Presento una queja' });
  assert.equal(res.handoff, true);
  assert.equal(res.reply, '');
});
