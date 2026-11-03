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

export function isWithinJoinWindow(session, now = new Date()) {
  const startTime = new Date(session.startDateTime).getTime()
  const durationMinutes = Number(session.durationMinutes)
  const currentTime = now.getTime()

  if (
    !Number.isFinite(startTime) ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0 ||
    !Number.isFinite(currentTime)
  ) {
    return false
  }

  const joinOpenTime = startTime - 60 * 60 * 1000
  const endTime = startTime + durationMinutes * 60 * 1000

  return currentTime >= joinOpenTime && currentTime < endTime
}