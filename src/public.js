export function getPublicStatus(mission) {
  return {
    id: mission.id,
    status: mission.status,
    history: [...mission.history],
  };
}
