import { API_BASE_URL } from './config'
import { apiFetch } from './apiClient'
import { ApiError, readErrorResponse } from './errors'
import {
  normalizeManagedSession,
  normalizeManagementSession,
  normalizeMySession,
  normalizeSession,
  normalizeSessionMutationResult,
} from '../utils/sessionModel'

function requireToken(accessToken, message) {
  if (!accessToken) {
    throw new ApiError(message, { status: 401 })
  }
}

function sessionUrl(sessionId, suffix = '') {
  return `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}${suffix}`
}

function authorizationHeaders(accessToken, extra = {}) {
  return {
    Accept: 'application/json',
    ...extra,
    Authorization: `Bearer ${accessToken}`,
  }
}

/**
 * GET /sessions — sessions eligible for the authenticated participant's age
 * category. The backend enforces eligibility, so no client-side filtering
 * is needed. The response never includes `zoom_url`.
 */
export async function getSessions(accessToken) {
  requireToken(accessToken, 'You must be logged in to view sessions.')

  const response = await apiFetch(`${API_BASE_URL}/sessions`, {
    method: 'GET',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not retrieve sessions (HTTP ${response.status}).`
    )
  }

  const sessions = await response.json().catch(() => null)

  if (!Array.isArray(sessions)) {
    throw new ApiError('The sessions response was not a list.')
  }

  return sessions.map(normalizeSession)
}

/**
 * GET /sessions/{id} — participant session detail (no `zoom_url`).
 */
export async function getSessionById(sessionId, accessToken) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to view this session.')

  const response = await apiFetch(sessionUrl(sessionId), {
    method: 'GET',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError('This session is not available for your account.', {
        status: 404,
      })
    }

    throw await readErrorResponse(
      response,
      `Could not retrieve the session (HTTP ${response.status}).`
    )
  }

  const session = await response.json().catch(() => null)

  if (!session?.id) {
    throw new ApiError('The server did not return valid session details.')
  }

  return normalizeSession(session)
}

/**
 * GET /sessions/my — the participant's registrations, including
 * `registration_state`, which drives the My Sessions states.
 */
export async function getMySessions(accessToken) {
  requireToken(accessToken, 'You must be logged in to retrieve your sessions.')

  const response = await apiFetch(`${API_BASE_URL}/sessions/my`, {
    method: 'GET',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not retrieve your sessions (HTTP ${response.status}).`
    )
  }

  const sessions = await response.json().catch(() => null)

  if (!Array.isArray(sessions)) {
    throw new ApiError('The my-sessions response was not a list.')
  }

  return sessions.map(normalizeMySession)
}

/**
 * GET /sessions/management — the manager's session list. This is the
 * manager data source (the participant endpoint only returns sessions
 * eligible for the manager's own age category).
 */
export async function getManagedSessions(accessToken) {
  requireToken(accessToken, 'You must be logged in to manage sessions.')

  const response = await apiFetch(`${API_BASE_URL}/sessions/management`, {
    method: 'GET',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not retrieve the managed sessions (HTTP ${response.status}).`
    )
  }

  const sessions = await response.json().catch(() => null)

  if (!Array.isArray(sessions)) {
    throw new ApiError('The management sessions response was not a list.')
  }

  return sessions.map(normalizeManagedSession)
}

/**
 * GET /sessions/{id}/management — counts, Zoom URL (manager only),
 * target categories and the attendee list used for attendance validation.
 */
export async function getManagementSession(sessionId, accessToken) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to manage this session.')

  const response = await apiFetch(sessionUrl(sessionId, '/management'), {
    method: 'GET',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not load management details (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!data?.id) {
    throw new ApiError('The server did not return valid session details.')
  }

  return normalizeManagementSession(data)
}

/**
 * POST /sessions — SessionCreateRequest (training_id or new_training_type,
 * instructor_id, target_age_category_ids, zoom_url …).
 */
export async function createSession(payload, accessToken) {
  requireToken(accessToken, 'You must be logged in to create a session.')

  const response = await apiFetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: authorizationHeaders(accessToken, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not create the session (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!data?.id) {
    throw new ApiError('The server did not return the created session ID.')
  }

  return normalizeSessionMutationResult(data)
}

/**
 * PUT /sessions/{id} — SessionUpdateRequest (training type is immutable).
 */
export async function updateSession(sessionId, payload, accessToken) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to update a session.')

  const response = await apiFetch(sessionUrl(sessionId), {
    method: 'PUT',
    headers: authorizationHeaders(accessToken, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not update the session (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!data?.id) {
    throw new ApiError('The server did not return the updated session ID.')
  }

  return normalizeSessionMutationResult(data)
}

/**
 * POST /sessions/{id}/cancel
 */
export async function cancelSession(sessionId, accessToken) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to cancel a session.')

  const response = await apiFetch(sessionUrl(sessionId, '/cancel'), {
    method: 'POST',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not cancel the session (HTTP ${response.status}).`
    )
  }
}

/**
 * POST /sessions/{id}/register
 */
export async function registerForSession(sessionId, accessToken) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to register.')

  const response = await apiFetch(sessionUrl(sessionId, '/register'), {
    method: 'POST',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not register for this session (HTTP ${response.status}).`
    )
  }

  if (response.status === 204) {
    return null
  }

  return response.json().catch(() => null)
}

/**
 * DELETE /sessions/{id}/register
 */
export async function unregisterFromSession(sessionId, accessToken) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to cancel a registration.')

  const response = await apiFetch(sessionUrl(sessionId, '/register'), {
    method: 'DELETE',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not cancel this registration (HTTP ${response.status}).`
    )
  }
}

/**
 * POST /sessions/{id}/join — the only endpoint that returns `zoom_url`.
 * The backend re-validates registration, eligibility and the time window,
 * and records attendance idempotently.
 */
export async function joinSession(sessionId, accessToken) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to join a session.')

  const response = await apiFetch(sessionUrl(sessionId, '/join'), {
    method: 'POST',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not join the session (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!data?.zoom_url) {
    throw new ApiError(
      'The meeting link is not available yet. Please try again shortly.'
    )
  }

  return data.zoom_url
}

/**
 * POST /sessions/{id}/attendance/validate — validates attended
 * registrations in bulk and makes the certificates available.
 */
export async function validateSessionAttendance(
  sessionId,
  registrationIds,
  accessToken
) {
  if (!sessionId) {
    throw new ApiError('A session ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to validate attendance.')

  if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
    throw new ApiError('Select at least one registration to validate.')
  }

  const response = await apiFetch(
    sessionUrl(sessionId, '/attendance/validate'),
    {
      method: 'POST',
      headers: authorizationHeaders(accessToken, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        registration_ids: registrationIds,
      }),
    }
  )

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not validate attendance (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!Number.isInteger(data?.validated_count) || data.validated_count < 0) {
    throw new ApiError('The server returned an invalid validation count.')
  }

  return data.validated_count
}
