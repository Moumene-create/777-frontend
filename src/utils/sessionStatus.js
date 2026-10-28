export function getSessionStatus(session, now = new Date()) {
  const startTime = new Date(session.startDateTime).getTime();
  const endTime = startTime + session.durationMinutes * 60 * 1000;
  const currentTime = now.getTime();

  if (currentTime >= endTime) return 'COMPLETED';
  if (currentTime >= startTime) return 'RUNNING';

  return 'OPEN';
}

export function isBeforeRegistrationCutoff(session, now = new Date()) {
  const startTime = new Date(session.startDateTime).getTime();
  const cutoffTime = startTime - 60 * 60 * 1000;

  return now.getTime() < cutoffTime;
}
