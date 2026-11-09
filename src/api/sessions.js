import { API_BASE_URL } from './config'

export async function getSessions(accessToken) {
  // to acceot json response
  const headers = {
    Accept: 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(
      `Could not retrieve sessions (HTTP ${response.status}).`
    )
  }

  const sessions = await response.json()

  if (!Array.isArray(sessions)) {
    throw new Error('The sessions response was not a list.')
  }

  return sessions.map(normalizeSession)
}

function normalizeSession(session) {
  const startDateTime =
    session.date && session.start_time
      ? new Date(`${session.date}T${session.start_time}`)
      : null

  return {
    id: session.id,
    title: session.title,
    description: session.description,
    date: session.date,
    startTime: session.start_time,
    startDateTime,
    durationMinutes: session.duration_minutes,
    maxCapacity: session.max_capacity,
    registeredCount: session.registered_count,
    instructorName: session.instructor_name,
    isCancelled: session.is_cancelled,
    status: session.status,
  }
}

export async function getSessionById(sessionId, accessToken) {
  if (!sessionId) {
    throw new Error('A session ID is required.')
  }

  const headers = {
    Accept: 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}`,
    {
      method: 'GET',
      headers,
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('This session could not be found.')
    }

    throw new Error(
      `Could not retrieve the session (HTTP ${response.status}).`
    )
  }

  const session = await response.json()

  return normalizeSession(session)
}