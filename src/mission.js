// Seules transitions autorisées (RO-06) : une étape à la fois, jamais depuis planned.
const NEXT_STATUS = Object.freeze({
  en_route: 'on_site',
  on_site: 'returning',
  returning: 'closed',
});

export function createMission({ id, contactEmail, gps, distanceKm, payloadKg, priority }) {
  return {
    id,
    contactEmail,
    gps: { ...gps },
    distanceKm,
    payloadKg,
    priority,
    status: 'planned',
    history: ['planned'],
  };
}

export function advanceMission(mission, nextStatus) {
  const isAllowed = Object.hasOwn(NEXT_STATUS, mission.status) && NEXT_STATUS[mission.status] === nextStatus;
  if (!isAllowed) {
    throw new Error(`Mission transition not allowed: ${mission.status} -> ${nextStatus}`);
  }
  return {
    ...mission,
    status: nextStatus,
    history: [...mission.history, nextStatus],
  };
}

export function cancelMission(mission) {
  if (mission.status !== 'planned') {
    throw new Error('Mission cancellation not allowed');
  }
  return {
    ...mission,
    status: 'canceled',
    history: [...mission.history, 'canceled'],
  };
}
