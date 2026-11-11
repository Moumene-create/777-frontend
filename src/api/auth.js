import { API_BASE_URL } from './config'
const AGE_CATEGORY_ID_TO_LABEL = {
  1: '7-10',
  2: '11-14',
  3: '15-17',
  4: '18-23',
  5: '24-30',
  6: '31-45',
  7: '46-60',
}

function getAgeCategoryLabel(ageCategoryId) {
  return AGE_CATEGORY_ID_TO_LABEL[ageCategoryId] ?? null
}


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

export async function updateCurrentUser(profileData, accessToken){
  if(!accessToken){
    throw new Error('An access token is required.')
  }

  const response = await fetch (`${API_BASE_URL}/auth/me`, {
    method:'PATCH',
    headers:{
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(
      profileData
    )
  })

  if(!response.ok) {
    const errorBody = await response.json().catch(() => null)

    let message = `Could not update your profile (HTTP ${response.status}).`

    if (typeof errorBody?.detail === 'string') {
      message = errorBody.detail
    } else if (response.status === 422) {
      message = 'Some profile information is invalid. Please check your entries.'
    }

    throw new Error(message)
  }
  return response.json()
}

export function normalizeUserInfo(profile){
  return{
    id : profile.id,
    firstName : profile.first_name,
    lastName : profile.last_name,
    email : profile.email,
    phone : profile.phone_number,
    dateOfBirth : profile.date_of_birth,
    ageCategory :getAgeCategoryLabel(profile.age_category_id),
    wilaya : profile.wilaya,
    role : profile.role,
   }
}

export function toProfileUpdatePayload(profile){
  return{
    first_name : profile.firstName,
    last_name : profile.lastName,
    email : profile.email,
    phone_number : profile.phone,
    date_of_birth : profile.dateOfBirth,
    wilaya : profile.wilaya,
   }
}