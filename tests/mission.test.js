import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceMission, cancelMission } from '../src/mission.js';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

test('T05 - mission créée planifiée avec historique', () => {
  const m = mission();
  assert.equal(m.status, 'planned');
  assert.deepEqual(m.history, ['planned']);
});

test('T06 - mission déployée suit normalement son parcours', () => {
  const deployed = deployDrone(drone(), mission()).mission;
  const onSite = advanceMission(deployed, 'on_site');
  const returning = advanceMission(onSite, 'returning');
  const closed = advanceMission(returning, 'closed');
  assert.equal(closed.status, 'closed');
  assert.deepEqual(closed.history, ['planned', 'en_route', 'on_site', 'returning', 'closed']);
});

test('T07 - annulation planifiée conserve la source', () => {
  const original = mission();
  const canceled = cancelMission(original);
  assert.equal(canceled.status, 'canceled');
  assert.deepEqual(canceled.history, ['planned', 'canceled']);
  assert.equal(original.status, 'planned');
});
