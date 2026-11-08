import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicStatus } from '../src/public.js';
import { mission } from './helpers.js';

test('T08 - le suivi public affiche la référence et le statut', () => {
  const summary = getPublicStatus(mission());
  assert.equal(summary.id, 'SOS-204');
  assert.equal(summary.status, 'planned');
});
