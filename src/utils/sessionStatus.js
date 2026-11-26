// Session lifecycle helpers.
//
// The backend computes the time-based status (`OPEN` / `RUNNING` /
// `COMPLETED`) and stores the explicit `CANCELLED` override, so the UI must
// prefer the server value. Local time math is only a fallback for responses
// that do not carry a status (and for the join-window countdown).

const STATUS_ORDER = {
  OPEN: 0,
  RUNNING: 1,
  FULL: 2,
  COMPLETED: 3,
  CANCELLED: 4,
}

const REGISTRATION_STATE_LABELS = {
  registered: 'Registered',
  pending: 'Registered',
  confirmed: 'Registered',
  ongoing: 'Ongoing',
  running: 'Ongoing',
  attended: 'Attended',
  validated: 'Attended',
  absent: 'Absent',
  missed: 'Absent',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  completed: 'Completed',
}

function toTimestamp(value) {
  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? NaN : parsed
  }

  return NaN
}

function getSessionWindow(session) {
  const start = toTimestamp(session?.startDateTime)
  const duration = Number(session?.durationMinutes)

  if (!Number.isFinite(start) || !Number.isFinite(duration) || duration <= 0) {
    return { start: null, end: null }
  }

  return { start, end: start + duration * 60_000 }
}

/**
 * Cancelled is the stored override; the time-derived lifecycle is computed
 * locally so badges keep advancing while a page stays open. The server
 * status is only a fallback when the date/time window is missing.
 */
export function getSessionStatus(session, now = new Date()) {
  if (!session) {
    return 'OPEN'
  }

  if (session.isCancelled || session.status === 'CANCELLED') {
    return 'CANCELLED'
  }

  const serverStatus =
    typeof session.status === 'string' ? session.status.toUpperCase() : ''

  const { start, end } = getSessionWindow(session)
  const current = toTimestamp(now)

  if (Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(current)) {
    if (current >= end) {
      return 'COMPLETED'
    }

    if (current >= start) {
      return 'RUNNING'
    }

    return 'OPEN'
  }

  if (
    serverStatus === 'OPEN' ||
    serverStatus === 'RUNNING' ||
    serverStatus === 'COMPLETED'
  ) {
    return serverStatus
  }

  return 'OPEN'
}

export function isSessionFull(session) {
  const capacity = Number(session?.maxCapacity)
  const registered = Number(session?.registeredCount)

  return (
    Number.isFinite(capacity) &&
    capacity > 0 &&
    Number.isFinite(registered) &&
    registered >= capacity
  )
}

/**
 * The badge shown in the UI: OPEN / RUNNING / FULL / COMPLETED / CANCELLED.
 * `FULL` is a derived capacity condition, not a stored lifecycle state.
 */
export function getSessionBadgeStatus(session, now = new Date()) {
  const status = getSessionStatus(session, now)

  if (status === 'CANCELLED' || status === 'COMPLETED' || status === 'RUNNING') {
    return status
  }

  return isSessionFull(session) ? 'FULL' : 'OPEN'
}

export function sortSessionsForDisplay(sessions, now = new Date()) {
  return [...(Array.isArray(sessions) ? sessions : [])].sort((left, right) => {
    const leftStatus = getSessionBadgeStatus(left, now)
    const rightStatus = getSessionBadgeStatus(right, now)
    const statusDelta =
      (STATUS_ORDER[leftStatus] ?? 99) - (STATUS_ORDER[rightStatus] ?? 99)

    if (statusDelta !== 0) {
      return statusDelta
    }

    const leftStart = toTimestamp(left?.startDateTime)
    const rightStart = toTimestamp(right?.startDateTime)

    if (!Number.isFinite(leftStart) || !Number.isFinite(rightStart)) {
      return 0
    }

    // Completed sessions are most useful newest-first; everything else
    // soonest-first, matching the SRS ordering recommendation.
    return leftStatus === 'COMPLETED' ? rightStart - leftStart : leftStart - rightStart
  })
}

/**
 * Registration/unregistration close one hour before the session starts.
 */
export function isBeforeRegistrationCutoff(session, now = new Date()) {
  const { start } = getSessionWindow(session)
  const current = toTimestamp(now)

  if (!Number.isFinite(start) || !Number.isFinite(current)) {
    return false
  }

  return current < start - 60 * 60 * 1000
}

export function getJoinWindow(session) {
  const { start, end } = getSessionWindow(session)

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return null
  }

  return {
    opensAt: new Date(start - 60 * 60 * 1000),
    closesAt: new Date(end),
  }
}

/**
 * Zoom access opens at T-60min and stays open until the session ends,
 * unless the session was cancelled.
 */
export function isJoinWindowOpen(session, now = new Date()) {
  if (!session || session.isCancelled) {
    return false
  }

  const status = getSessionStatus(session, now)
  const current = toTimestamp(now)
  const { start, end } = getSessionWindow(session)

  if (status === 'CANCELLED' || !Number.isFinite(current) || !Number.isFinite(start)) {
    return false
  }

  if (status === 'COMPLETED') {
    return false
  }

  return current >= start - 60 * 60 * 1000 && current < end
}

export function formatRegistrationState(state) {
  if (typeof state !== 'string' || state.trim() === '') {
    return null
  }

  const normalized = state.trim().toLowerCase()

  if (REGISTRATION_STATE_LABELS[normalized]) {
    return REGISTRATION_STATE_LABELS[normalized]
  }

  // Unknown backend value: present it readably instead of hiding it.
  return normalized
    .replace(/[_-]+/g, ' ')
    .replace(/^\w/, (character) => character.toUpperCase())
}

export function isActiveRegistration(state) {
  if (typeof state !== 'string' || state.trim() === '') {
    return true
  }

  return !['cancelled', 'canceled'].includes(state.trim().toLowerCase())
}

/**
 * Participant-facing state for one of their registrations.
 * Prefers the backend `registration_state`, then falls back to the session
 * lifecycle so the UI never has to guess from attendance data it does not
 * receive.
 */
export function getMySessionDisplayState(mySession, now = new Date()) {
  const status = getSessionStatus(mySession, now)

  if (status === 'CANCELLED') {
    return 'Cancelled'
  }

  const registrationState = formatRegistrationState(mySession?.registrationState)

  if (registrationState === 'Cancelled') {
    return 'Cancelled'
  }

  if (registrationState === 'Attended' || registrationState === 'Absent') {
    return registrationState
  }

  if (registrationState === 'Ongoing' || status === 'RUNNING') {
    return 'Ongoing'
  }

  if (status === 'COMPLETED') {
    return registrationState ?? 'Completed'
  }

  return registrationState ?? 'Registered'
}
