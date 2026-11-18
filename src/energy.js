// Simulation pédagogique : coût en points de batterie, sans pilotage réel.
const MAX_PAYLOAD_KG = 5;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function estimateEnergy(distanceKm, payloadKg) {
  if (!isFiniteNumber(distanceKm) || distanceKm <= 0) {
    throw new RangeError('distanceKm must be a finite number > 0');
  }
  if (!isFiniteNumber(payloadKg) || payloadKg < 0 || payloadKg > MAX_PAYLOAD_KG) {
    throw new RangeError('payloadKg must be a finite number between 0 and 5');
  }
  return Math.ceil(distanceKm * 4 + payloadKg * 3 + 5);
}
