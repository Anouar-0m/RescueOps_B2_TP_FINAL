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

function missionAt(status) {
  if (status === 'planned') return mission();
  if (status === 'canceled') return cancelMission(mission());
  let current = deployDrone(drone(), mission()).mission;
  for (const next of ['on_site', 'returning', 'closed']) {
    if (current.status === status) return current;
    current = advanceMission(current, next);
  }
  return current;
}

const ALL_STATUSES = ['planned', 'en_route', 'on_site', 'returning', 'closed', 'canceled'];
const ALLOWED = { en_route: 'on_site', on_site: 'returning', returning: 'closed' };

test('T16 - chaque étape valide crée un nouvel objet sans toucher la source (RO-06)', () => {
  for (const [from, to] of Object.entries(ALLOWED)) {
    const source = missionAt(from);
    const before = structuredClone(source);
    const next = advanceMission(source, to);
    assert.equal(next.status, to);
    assert.deepEqual(next.history, [...before.history, to]);
    assert.deepEqual(source, before, `${from} -> ${to} : source intacte`);
  }
});

test('T17 - sauts, retours, répétitions et départ depuis planned sont interdits (RO-03, RO-06)', () => {
  for (const from of ['planned', 'en_route', 'on_site', 'returning']) {
    for (const to of [...ALL_STATUSES, 'inconnu']) {
      if (ALLOWED[from] === to) continue;
      const source = missionAt(from);
      const before = structuredClone(source);
      assert.throws(() => advanceMission(source, to), Error, `${from} -> ${to}`);
      assert.deepEqual(source, before, `${from} -> ${to} : source intacte`);
    }
  }
});

test('T18 - closed et canceled sont terminaux (RO-06)', () => {
  for (const from of ['closed', 'canceled']) {
    for (const to of [...ALL_STATUSES, 'inconnu']) {
      const source = missionAt(from);
      const before = structuredClone(source);
      assert.throws(() => advanceMission(source, to), Error, `${from} -> ${to}`);
      assert.deepEqual(source, before, `${from} -> ${to} : source intacte`);
    }
  }
});

test('T19 - annulation refusée dès que la mission n\'est plus planned (RO-07)', () => {
  for (const from of ['en_route', 'on_site', 'returning', 'closed', 'canceled']) {
    const source = missionAt(from);
    const before = structuredClone(source);
    assert.throws(() => cancelMission(source), Error, `annulation depuis ${from}`);
    assert.deepEqual(source, before, `annulation depuis ${from} : source intacte`);
  }
});
