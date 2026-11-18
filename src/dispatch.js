import { estimateEnergy } from './energy.js';

const MIN_RESERVE_POINTS = 20;

export function createDrone(id, batteryPoints, status = 'available') {
  return { id, batteryPoints, status };
}

export function deployDrone(drone, mission) {
  if (drone.status !== 'available') {
    throw new Error('Drone not available');
  }
  if (mission.status !== 'planned') {
    throw new Error('Mission not planned');
  }
  const energyUsed = estimateEnergy(mission.distanceKm, mission.payloadKg);
  // Garde "fail-closed" : une batterie non numérique (NaN) est refusée aussi.
  if (!(drone.batteryPoints - energyUsed >= MIN_RESERVE_POINTS)) {
    throw new RangeError('Insufficient battery reserve');
  }
  return {
    drone: {
      ...drone,
      batteryPoints: drone.batteryPoints - energyUsed,
      status: 'busy',
    },
    mission: {
      ...mission,
      status: 'en_route',
      droneId: drone.id,
      history: [...mission.history, 'en_route'],
    },
    energyUsed,
  };
}
