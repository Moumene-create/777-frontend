// Pure mappers between the backend JSON payloads (snake_case) and the
// frontend session model (camelCase). Kept free of `import.meta.env`
// imports so they can be unit tested with `node --test`.

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toString(value) {
  return typeof value === 'string' ? value : ''
}

function toNullableString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function normalizeStatus(value) {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim().toUpperCase()
    : null
}

/**
 * Builds a local Date from the API's separate `date` + `start_time` fields.
 */
export function buildSessionStartDateTime(date, startTime) {
  if (typeof date !== 'string' || !date || typeof startTime !== 'string' || !startTime) {
    return null
  }

  const parsed = new Date(`${date}T${startTime}`)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * `SessionListItemResponse` / `SessionListItemResponse` (detail) — the
 * participant-facing session shape returned by `/sessions` and
 * `/sessions/{id}`. Note: the API never returns `zoom_url` or the target
 * age category ids here; eligibility is enforced server-side.
 */
export function normalizeSession(raw) {
  const session = raw ?? {}
  const date = toString(session.date)
  const startTime = toString(session.start_time)

  return {
    id: session.id ?? null,
    title: toString(session.title),
    description: toString(session.description),
    trainingTypeDescription: toNullableString(session.training_type_description),
    prerequisites: toNullableString(session.prerequisites),
    date,
    startTime,
    startDateTime: buildSessionStartDateTime(date, startTime),
    durationMinutes: toNumber(session.duration_minutes),
    maxCapacity: toNumber(session.max_capacity),
    registeredCount: toNumber(session.registered_count),
    instructorName: toString(session.instructor_name),
    isCancelled: session.is_cancelled === true,
    status: normalizeStatus(session.status),
  }
}

/**
 * `MySessionItemResponse` — a participant session enriched with the
 * registration relationship. `registration_state` is the backend's
 * participant-session state (registered / attended / absent / cancelled …).
 */
export function normalizeMySession(raw) {
  const session = raw ?? {}

  return {
    ...normalizeSession(session),
    registrationId: session.registration_id ?? null,
    registrationState: toNullableString(session.registration_state),
    registeredAt: session.registered_at ?? null,
  }
}

/**
 * `SessionManagementListItemResponse` — the manager-facing list item.
 */
export function normalizeManagedSession(raw) {
  const session = raw ?? {}
  const date = toString(session.date)
  const startTime = toString(session.start_time)

  return {
    id: session.id ?? null,
    title: toString(session.title),
    date,
    startTime,
    startDateTime: buildSessionStartDateTime(date, startTime),
    durationMinutes: toNumber(session.duration_minutes),
    maxCapacity: toNumber(session.max_capacity),
    registeredCount: toNumber(session.registered_count),
    instructorId: session.instructor_id ?? null,
    instructorName: toString(session.instructor_name),
    status: normalizeStatus(session.status),
    targetAgeCategoryIds: Array.isArray(session.target_age_category_ids)
      ? session.target_age_category_ids.map((id) => toNumber(id)).filter(Number.isFinite)
      : [],
  }
}

/**
 * `SessionAttendeeResponse` — attendance is recorded by the backend when
 * the participant opens the Zoom link, so this is the manager's validation
 * source of truth.
 */
export function normalizeAttendee(raw) {
  const attendee = raw ?? {}

  return {
    registrationId: attendee.registration_id ?? null,
    firstName: toString(attendee.first_name),
    lastName: toString(attendee.last_name),
    fullName: `${toString(attendee.first_name)} ${toString(attendee.last_name)}`.trim(),
    hasAttended: attendee.has_attended === true,
    attendanceValidated: attendee.attendance_validated === true,
  }
}

/**
 * `SessionManagementDetailResponse` — manager detail with counts, Zoom URL,
 * target categories and the attendee list.
 */
export function normalizeManagementSession(raw) {
  const session = raw ?? {}
  const date = toString(session.date)
  const startTime = toString(session.start_time)

  return {
    ...normalizeSession(session),
    trainingId: session.training_id ?? null,
    attendedCount: toNumber(session.attended_count),
    absentCount: toNumber(session.absent_count),
    zoomUrl: toString(session.zoom_url),
    targetAgeCategoryIds: Array.isArray(session.target_age_category_ids)
      ? session.target_age_category_ids.map((id) => toNumber(id)).filter(Number.isFinite)
      : [],
    attendees: Array.isArray(session.attendees)
      ? session.attendees.map(normalizeAttendee)
      : [],
    instructorId: session.instructor_id ?? null,
    date,
    startTime,
  }
}

/**
 * `SessionCreateResponse` / `SessionUpdateResponse` are close enough to the
 * management detail for the manager UI; normalise them defensively.
 */
export function normalizeSessionMutationResult(raw) {
  const session = raw ?? {}

  return {
    id: session.id ?? null,
    trainingId: session.training_id ?? null,
    title: toString(session.title),
    isCancelled: session.is_cancelled === true,
  }
}
