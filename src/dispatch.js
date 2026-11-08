import { estimateEnergy } from './energy.js';

export function createDrone(id, batteryPoints, status = 'available') {
  return { id, batteryPoints, status };
}

export function deployDrone(drone, mission) {
  const energyUsed = estimateEnergy(mission.distanceKm, mission.payloadKg);
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
