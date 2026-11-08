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
