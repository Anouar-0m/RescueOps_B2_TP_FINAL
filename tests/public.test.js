import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicStatus } from '../src/public.js';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

test('T08 - le suivi public affiche la référence et le statut', () => {
  const summary = getPublicStatus(mission());
  assert.equal(summary.id, 'SOS-204');
  assert.equal(summary.status, 'planned');
});

test('T20 - la vue publique contient exactement id, status, history (RO-08)', () => {
  const summary = getPublicStatus(mission());
  assert.deepEqual(Object.keys(summary).sort(), ['history', 'id', 'status']);
});

test('T21 - aucune donnée interne ne sort dans la vue publique (RO-08)', () => {
  const deployed = deployDrone(drone(), mission()).mission;
  const json = JSON.stringify(getPublicStatus(deployed));
  for (const secret of ['contactEmail', 'famille@example.test', 'gps', '45.1201', 'priority', 'critical', 'droneId', 'DR-07']) {
    assert.equal(json.includes(secret), false, `fuite : ${secret}`);
  }
});

test('T22 - history public est une copie indépendante (RO-08)', () => {
  const m = mission();
  const summary = getPublicStatus(m);
  assert.notEqual(summary.history, m.history);
  summary.history.push('hack');
  assert.deepEqual(m.history, ['planned']);
});
