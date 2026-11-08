import { API_BASE_URL } from './config'

export async function login({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Login was rejected. Check your credentials.')
    }

    throw new Error(`Login failed (HTTP ${response.status}).`)
  }

  return response.json()
}
export async function getCurrentUser(accessToken) {
  if (!accessToken) {
    throw new Error('An access token is required.')
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
      `Could not retrieve the current user (HTTP ${response.status}).`
    )
  }

  return response.json()
}