import { createMission } from '../src/mission.js';
import { createDrone } from '../src/dispatch.js';

export function mission() {
  return createMission({
    id: 'SOS-204',
    contactEmail: 'famille@example.test',
    gps: { lat: 45.1201, lon: 5.7123 },
    distanceKm: 5,
    payloadKg: 2,
    priority: 'critical',
  });
}
export function drone(batteryPoints = 70, status = 'available') {
  return createDrone('DR-07', batteryPoints, status);
}
