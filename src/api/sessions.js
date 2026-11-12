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
    isRegistered: session.is_registered ?? false,
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

  if (response.status === 422) {
    throw new Error('This session link is invalid.')
  }

    throw new Error(
      `Could not retrieve the session (HTTP ${response.status}).`
    )
  }

  const session = await response.json()

  return normalizeSession(session)
}

function getErrorMessage(errorBody, fallbackMessage) {
  if (typeof errorBody?.detail === 'string') {
    return errorBody.detail
  }

  if (Array.isArray(errorBody?.detail) && errorBody.detail.length > 0) {
    return errorBody.detail[0].msg ?? fallbackMessage
  }

  return fallbackMessage
}

export async function registerForSession(sessionId, accessToken) {
  if (!sessionId) {
    throw new Error('A session ID is required.')
  }

  if (!accessToken) {
    throw new Error('You must be logged in to register.')
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/register`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    throw new Error(
      getErrorMessage(
        errorBody,
        `Could not register for this session (HTTP ${response.status}).`
      )
    )
  }

  return response.json()
}

export async function unregisterFromSession(sessionId, accessToken) {
  if (!sessionId) {
    throw new Error('A session ID is required.')
  }

  if (!accessToken) {
    throw new Error('You must be logged in to cancel a registration.')
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/register`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    throw new Error(
      getErrorMessage(
        errorBody,
        `Could not cancel this registration (HTTP ${response.status}).`
      )
    )
  }

  return 
}

export async function getMySessions(accessToken) {
  if (!accessToken) {
    throw new Error('You must be logged in to retrieve your sessions.')
  }

  const response = await fetch(`${API_BASE_URL}/sessions/my`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('The access token was rejected or has expired.')
    }

    throw new Error(
      `Could not retrieve your sessions (HTTP ${response.status}).`
    )
  }

  const mySessions = await response.json()

  if (!Array.isArray(mySessions)) {
    throw new Error('The my-sessions response was not a list.')
  }

  return mySessions
}

export async function createSession(payload, accessToken) {
  if (!accessToken) {
    throw new Error('You must be logged in to create a session.')
  }

  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    let message = `Could not create the session (HTTP ${response.status}).`

    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((error) => {
          const field = (error.loc || [])
            .filter((part) => part !== 'body')
            .join('.')

          return field ? `${field}: ${error.msg}` : error.msg
        })
        .filter(Boolean)
        .join('\n') || message
    }

    throw new Error(message)
  }

  if (!data?.id) {
    throw new Error('The server did not return the created session ID.')
  }

  return data
}

export async function getManagementSession(sessionId, accessToken) {
  if (!sessionId || !accessToken) {
    throw new Error('A session ID and login are required.')
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/management`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    let message =
      `Could not load management details (HTTP ${response.status}).`

    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((error) => error.msg)
        .filter(Boolean)
        .join(' ') || message
    }

    throw new Error(message)
  }

  if (!data?.id) {
    throw new Error('The server did not return valid session details.')
  }

  return {
    ...normalizeSession(data),
    trainingId: data.training_id,
    attendedCount: data.attended_count,
    absentCount: data.absent_count,
    zoomUrl: data.zoom_url,
    targetAgeCategoryIds: data.target_age_category_ids,
  }
}

export async function updateSession(sessionId, payload, accessToken) {
  if (!sessionId || !accessToken) {
    throw new Error('A session ID and login are required.')
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    let message = `Could not update the session (HTTP ${response.status}).`

    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((error) => {
          const field = (error.loc || [])
            .filter((part) => part !== 'body')
            .join('.')

          return field ? `${field}: ${error.msg}` : error.msg
        })
        .filter(Boolean)
        .join('\n') || message
    }

    throw new Error(message)
  }

  if (!data?.id) {
    throw new Error('The server did not return the updated session ID.')
  }

  return data
}

export async function cancelSession(sessionId, accessToken) {
  if (!sessionId || !accessToken) {
    throw new Error('A session ID and login are required.')
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/cancel`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const data = await response.json().catch(() => null)

    let message = `Could not cancel the session (HTTP ${response.status}).`

    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((error) => error.msg)
        .filter(Boolean)
        .join(' ') || message
    }

    throw new Error(message)
  }
}

export async function validateSessionAttendance(
  sessionId,
  registrationIds,
  accessToken
) {
  if (!sessionId || !accessToken) {
    throw new Error('A session ID and login are required.')
  }

  if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
    throw new Error('Select at least one registration to validate.')
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/attendance/validate`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        registration_ids: registrationIds,
      }),
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    let message =
      `Could not validate attendance (HTTP ${response.status}).`

    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((error) => error.msg)
        .filter(Boolean)
        .join(' ') || message
    }

    throw new Error(message)
  }

  if (!Number.isInteger(data?.validated_count) || data.validated_count < 0) {
    throw new Error('The server returned an invalid validation count.')
  }

  return data.validated_count
}