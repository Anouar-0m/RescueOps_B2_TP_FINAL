import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateEnergy } from '../src/energy.js';

test('T01 - mission 5 km et charge 2 kg consomme 31 points', () => {
  assert.equal(estimateEnergy(5, 2), 31);
});

test('T02 - mission 1 km sans charge consomme 9 points', () => {
  assert.equal(estimateEnergy(1, 0), 9);
});

test('T09 - distance invalide refusée avec RangeError avant calcul (RO-02)', () => {
  for (const bad of [0, -1, Infinity, NaN, '5', null, undefined]) {
    assert.throws(() => estimateEnergy(bad, 2), RangeError, `distance ${String(bad)}`);
  }
});

test('T10 - charge invalide refusée avec RangeError avant calcul (RO-02)', () => {
  for (const bad of [5.1, -1, Infinity, NaN, '2', null, undefined]) {
    assert.throws(() => estimateEnergy(5, bad), RangeError, `charge ${String(bad)}`);
  }
});

test('T11 - bornes valides acceptées et formule inchangée (RO-01, RO-02)', () => {
  assert.equal(estimateEnergy(1, 0), 9);
  assert.equal(estimateEnergy(5, 2), 31);
  assert.equal(estimateEnergy(1, 5), 24);
  assert.equal(estimateEnergy(0.5, 0), 7);
});
