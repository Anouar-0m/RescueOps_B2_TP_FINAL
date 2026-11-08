import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateEnergy } from '../src/energy.js';

test('T01 - mission 5 km et charge 2 kg consomme 31 points', () => {
  assert.equal(estimateEnergy(5, 2), 31);
});

test('T02 - mission 1 km sans charge consomme 9 points', () => {
  assert.equal(estimateEnergy(1, 0), 9);
});
