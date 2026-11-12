import { API_BASE_URL } from './config'

export async function getTrainingTypes(accessToken) {
  if (!accessToken) {
    throw new Error('You must be logged in to load training types.')
  }

  const response = await fetch(`${API_BASE_URL}/training-types`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : `Could not load training types (HTTP ${response.status}).`
    )
  }

  if (!Array.isArray(data)) {
    throw new Error('The training types response was not a list.')
  }

  return data
}