import { createMission, advanceMission } from '../src/mission.js';
import { createDrone, deployDrone } from '../src/dispatch.js';
import { getPublicStatus } from '../src/public.js';

const mission = createMission({
  id: 'SOS-204', contactEmail: 'famille@example.test',
  gps: { lat: 45.1201, lon: 5.7123 },
  distanceKm: 5, payloadKg: 2, priority: 'critical',
});
const rescueDrone = createDrone('DR-07', 70);
console.log('=== RESCUEOPS : simulation pédagogique ===');
console.log('Batterie au départ :', rescueDrone.batteryPoints, 'points');
const deployed = deployDrone(rescueDrone, mission);
console.log('Énergie consommée :', deployed.energyUsed, 'points');
console.log('Batterie après départ :', deployed.drone.batteryPoints, 'points');
console.log('Mission :', deployed.mission.status);
console.log('Vue publique :', JSON.stringify(getPublicStatus(deployed.mission), null, 2));
const onSite = advanceMission(deployed.mission, 'on_site');
console.log('Étape suivante :', onSite.status);
console.log('--- Simulation à risque : drone avec 35 points ---');
try {
  const result = deployDrone(createDrone('DR-LOW', 35), mission);
  console.log('ACCEPTÉ : réserve après départ =', result.drone.batteryPoints, '(risque métier)');
} catch (error) {
  console.log('REFUSÉ :', error.message);
}
