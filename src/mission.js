const KNOWN_STATUSES = ['planned', 'en_route', 'on_site', 'returning', 'closed'];

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
  if (!KNOWN_STATUSES.includes(nextStatus)) {
    throw new Error('Mission transition not allowed');
  }
  return {
    ...mission,
    status: nextStatus,
    history: [...mission.history, nextStatus],
  };
}

export function cancelMission(mission) {
  if (mission.status === 'closed' || mission.status === 'canceled') {
    throw new Error('Mission cancellation not allowed');
  }
  return {
    ...mission,
    status: 'canceled',
    history: [...mission.history, 'canceled'],
  };
}
