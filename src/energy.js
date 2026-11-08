// Simulation pédagogique : coût en points de batterie, sans pilotage réel.
export function estimateEnergy(distanceKm, payloadKg) {
  return Math.ceil(distanceKm * 4 + payloadKg * 3 + 5);
}
