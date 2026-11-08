export function getPublicStatus(mission) {
  return {
    id: mission.id,
    status: mission.status,
    history: mission.history,
    contactEmail: mission.contactEmail,
    gps: { ...mission.gps },
    priority: mission.priority,
  };
}
