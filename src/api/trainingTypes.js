import { API_BASE_URL } from './config'
import { apiFetch } from './apiClient'
import { ApiError, readErrorResponse } from './errors'
import { normalizeTrainingType } from '../utils/trainingType'

/**
 * GET /training-types — the reusable training catalogue used by the session
 * form (existing training selection).
 */
export async function getTrainingTypes(accessToken) {
  if (!accessToken) {
    throw new ApiError('You must be logged in to load training types.', {
      status: 401,
    })
  }

  const response = await apiFetch(`${API_BASE_URL}/training-types`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not load training types (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!Array.isArray(data)) {
    throw new ApiError('The training types response was not a list.')
  }

  return data.map(normalizeTrainingType)
}
