import { API_BASE_URL } from './config'
import { apiFetch } from './apiClient'
import { ApiError, readErrorResponse } from './errors'

function requireToken(accessToken, message) {
  if (!accessToken) {
    throw new ApiError(message, { status: 401 })
  }
}

function normalizeCertificate(raw) {
  const certificate = raw ?? {}

  return {
    registrationId: certificate.registration_id ?? null,
    certificateId: certificate.certificate_id ?? null,
    participantFirstName: certificate.participant_first_name ?? '',
    participantLastName: certificate.participant_last_name ?? '',
    sessionTitle: certificate.session_title ?? '',
    sessionDate: certificate.session_date ?? '',
    issuedAt: certificate.issued_at ?? null,
  }
}

/**
 * GET /certificates/ — certificates issued to the authenticated participant.
 * Certificates only exist after a session manager validated the attendance.
 */
export async function getCertificates(accessToken) {
  requireToken(accessToken, 'You must be logged in to view certificates.')

  const response = await apiFetch(`${API_BASE_URL}/certificates/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not load certificates (HTTP ${response.status}).`
    )
  }

  const data = await response.json().catch(() => null)

  if (!Array.isArray(data)) {
    throw new ApiError('The certificates response was not a list.')
  }

  return data.map(normalizeCertificate)
}

/**
 * GET /certificates/{registration_id}/pdf — server-rendered PDF.
 */
export async function getCertificatePdf(registrationId, accessToken) {
  if (!registrationId) {
    throw new ApiError('A registration ID is required.')
  }

  requireToken(accessToken, 'You must be logged in to download a certificate.')

  const response = await apiFetch(
    `${API_BASE_URL}/certificates/${encodeURIComponent(registrationId)}/pdf`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw await readErrorResponse(
      response,
      `Could not download certificate (HTTP ${response.status}).`
    )
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase()

  // The OpenAPI document declares this endpoint as `application/json`, but a
  // successful response should be a binary PDF. If the backend answered with
  // JSON, surface its message instead of downloading an error document.
  if (contentType.includes('application/json')) {
    throw await readErrorResponse(
      response,
      'The server did not return a PDF certificate.'
    )
  }

  const pdf = await response.blob()

  if (pdf.size === 0) {
    throw new ApiError('The server returned an empty PDF.')
  }

  return pdf
}
