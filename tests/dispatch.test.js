import test from 'node:test';
import assert from 'node:assert/strict';
import { deployDrone } from '../src/dispatch.js';
import { mission, drone } from './helpers.js';

test('T03 - départ de drone sur mission planifiée', () => {
  const result = deployDrone(drone(), mission());
  assert.equal(result.energyUsed, 31);
  assert.equal(result.drone.batteryPoints, 39);
  assert.equal(result.drone.status, 'busy');
  assert.equal(result.mission.status, 'en_route');
  assert.deepEqual(result.mission.history, ['planned', 'en_route']);
});

test('T04 - départ réussi ne mute pas les entrées', () => {
  const originalMission = mission();
  const originalDrone = drone();
  const mBefore = structuredClone(originalMission);
  const dBefore = structuredClone(originalDrone);
  deployDrone(originalDrone, originalMission);
  assert.deepEqual(originalMission, mBefore);
  assert.deepEqual(originalDrone, dBefore);
});

test('T12 - réserve minimale de 20 points après départ (RO-04)', () => {
  for (const battery of [35, 50]) {
    assert.throws(() => deployDrone(drone(battery), mission()), RangeError, `batterie ${battery}`);
  }
  const limit = deployDrone(drone(51), mission());
  assert.equal(limit.energyUsed, 31);
  assert.equal(limit.drone.batteryPoints, 20);
  const nominal = deployDrone(drone(70), mission());
  assert.equal(nominal.drone.batteryPoints, 39);
});

test('T13 - seul un drone available peut partir sur une mission planned (RO-03)', () => {
  for (const status of ['busy', 'maintenance', 'offline']) {
    assert.throws(() => deployDrone(drone(70, status), mission()), Error, `drone ${status}`);
  }
  for (const status of ['en_route', 'on_site', 'returning', 'closed', 'canceled']) {
    assert.throws(() => deployDrone(drone(), { ...mission(), status }), Error, `mission ${status}`);
  }
});

test('T14 - un refus ne modifie ni le drone ni la mission (RO-03, RO-04)', () => {
  const cases = [
    ['batterie insuffisante', drone(35), mission()],
    ['drone occupé', drone(70, 'busy'), mission()],
    ['mission déjà en route', drone(), { ...mission(), status: 'en_route' }],
  ];
  for (const [label, d, m] of cases) {
    const dBefore = structuredClone(d);
    const mBefore = structuredClone(m);
    assert.throws(() => deployDrone(d, m), Error, label);
    assert.deepEqual(d, dBefore, `${label} : drone intact`);
    assert.deepEqual(m, mBefore, `${label} : mission intacte`);
  }
});

test('T15 - un départ accepté crée de nouveaux objets (RO-05)', () => {
  const d = drone();
  const m = mission();
  const result = deployDrone(d, m);
  assert.notEqual(result.drone, d);
  assert.notEqual(result.mission, m);
  assert.notEqual(result.mission.history, m.history);
  assert.equal(result.mission.droneId, 'DR-07');
  assert.deepEqual(result.mission.history, ['planned', 'en_route']);
  assert.equal(d.status, 'available');
  assert.equal(d.batteryPoints, 70);
  assert.equal(m.status, 'planned');
  assert.equal(m.droneId, undefined);
  assert.deepEqual(m.history, ['planned']);
});

test('T23 - batterie non numérique refusée, la garde ne s\'ouvre pas sur NaN (RO-04, revue R-01)', () => {
  for (const battery of [NaN, undefined, 'abc']) {
    const d = { ...drone(), batteryPoints: battery };
    const m = mission();
    const dBefore = structuredClone(d);
    const mBefore = structuredClone(m);
    assert.throws(() => deployDrone(d, m), RangeError, `batterie ${String(battery)}`);
    assert.deepEqual(d, dBefore, `batterie ${String(battery)} : drone intact`);
    assert.deepEqual(m, mBefore, `batterie ${String(battery)} : mission intacte`);
  }
});
