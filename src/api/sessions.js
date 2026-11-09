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
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    date: session.date,
    startTime: session.start_time,
    durationMinutes: session.duration_minutes,
    maxCapacity: session.max_capacity,
    registeredCount: session.registered_count,
    instructorName: session.instructor_name,
    isCancelled: session.is_cancelled,
    status: session.status,
  }
}