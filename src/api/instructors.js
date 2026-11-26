import { API_BASE_URL } from './config'
import { apiFetch } from './apiClient'
import { ApiError, readErrorResponse } from './errors'
import {
  normalizeInstructor,
  normalizePublicInstructor,
} from '../utils/instructor'

function requireToken(accessToken, message) {
  if (!accessToken) {
    throw new ApiError(message, { status: 401 })
  }
}

function authorizationHeaders(accessToken, extra = {}) {
  return {
    Accept: 'application/json',
    ...extra,
    Authorization: `Bearer ${accessToken}`,
  }
}

async function request(url, options) {
  try {
    return await apiFetch(url, options)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      { status: 0 }
    )
  }
}

async function publicRequest(url, options) {
  try {
    return await fetch(url, options)
  } catch {
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
      { status: 0 }
    )
  }
}

function fallbackForStatus(status) {
  if (status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  if (status === 403) {
    return 'You do not have permission to manage instructors. Session manager access is required.'
  }

  if (status === 404) {
    return 'Instructor not found.'
  }

  if (status === 409) {
    return 'The instructor could not be saved because of a conflict.'
  }

  if (status === 413) {
    return 'The uploaded photo exceeds the 5 MB limit.'
  }

  return `The instructor request failed (HTTP ${status}).`
}

async function readInstructorError(response) {
  return readErrorResponse(response, fallbackForStatus(response.status))
}

async function readInstructorBody(response, fallback) {
  const data = await response.json().catch(() => null)

  if (!data?.id) {
    throw new ApiError(fallback)
  }

  return normalizeInstructor(data, { baseUrl: API_BASE_URL })
}

export async function getInstructors(accessToken) {
  requireToken(accessToken, 'Please log in again to load instructors.')

  const response = await request(`${API_BASE_URL}/instructors`, {
    method: 'GET',
    headers: authorizationHeaders(accessToken),
  })

  if (!response.ok) {
    throw await readInstructorError(response)
  }

  const data = await response.json().catch(() => null)

  if (!Array.isArray(data)) {
    throw new ApiError('The instructors response was not a list.')
  }

  return data
    .map((instructor) =>
      normalizeInstructor(instructor, { baseUrl: API_BASE_URL })
    )
    .filter((instructor) => instructor.id)
}

export async function getInstructor(instructorId, accessToken) {
  if (!instructorId) {
    throw new ApiError('An instructor ID is required.')
  }

  requireToken(accessToken, 'Please log in again to view this instructor.')

  const response = await request(
    `${API_BASE_URL}/instructors/${encodeURIComponent(instructorId)}`,
    {
      method: 'GET',
      headers: authorizationHeaders(accessToken),
    }
  )

  if (!response.ok) {
    throw await readInstructorError(response)
  }

  const data = await response.json().catch(() => null)

  if (!data?.id) {
    throw new ApiError('The server did not return valid instructor details.')
  }

  return normalizeInstructor(data, { baseUrl: API_BASE_URL })
}

export async function createInstructor(payload, accessToken) {
  requireToken(accessToken, 'Please log in again to create an instructor.')

  const response = await request(`${API_BASE_URL}/instructors`, {
    method: 'POST',
    headers: authorizationHeaders(accessToken, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw await readInstructorError(response)
  }

  return readInstructorBody(response, 'The server did not return the created instructor.')
}

export async function updateInstructor(instructorId, payload, accessToken) {
  if (!instructorId) {
    throw new ApiError('An instructor ID is required.')
  }

  requireToken(accessToken, 'Please log in again to update this instructor.')

  const response = await request(
    `${API_BASE_URL}/instructors/${encodeURIComponent(instructorId)}`,
    {
      method: 'PUT',
      headers: authorizationHeaders(accessToken, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    throw await readInstructorError(response)
  }

  return readInstructorBody(response, 'The server did not return the updated instructor.')
}

export async function deleteInstructor(instructorId, accessToken) {
  if (!instructorId) {
    throw new ApiError('An instructor ID is required.')
  }

  requireToken(accessToken, 'Please log in again to delete this instructor.')

  const response = await request(
    `${API_BASE_URL}/instructors/${encodeURIComponent(instructorId)}`,
    {
      method: 'DELETE',
      headers: authorizationHeaders(accessToken),
    }
  )

  if (!response.ok) {
    throw await readInstructorError(response)
  }
}

export async function uploadInstructorPhoto(instructorId, file, accessToken) {
  if (!instructorId) {
    throw new ApiError('An instructor ID is required.')
  }

  requireToken(accessToken, 'Please log in again to upload a photo.')

  const formData = new FormData()
  formData.append('file', file)

  const response = await request(
    `${API_BASE_URL}/instructors/${encodeURIComponent(instructorId)}/photo`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    throw await readInstructorError(response)
  }

  return readInstructorBody(response, 'The server did not return the updated instructor.')
}

/**
 * GET /public/instructors — intentionally unauthenticated. The response is
 * reduced to public fields, so email and phone cannot leak into the UI.
 */
export async function getPublicInstructors() {
  const response = await publicRequest(`${API_BASE_URL}/public/instructors`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not load featured instructors (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!Array.isArray(data)) {
    throw new ApiError('The public instructors response was not a list.')
  }

  return data
    .map((instructor) =>
      normalizePublicInstructor(instructor, { baseUrl: API_BASE_URL })
    )
    .filter((instructor) => instructor.id && instructor.photoSrc)
}
