import { API_BASE_URL } from './config'

export async function getCertificates(accessToken) {
  if (!accessToken) {
    throw new Error('You must be logged in to view certificates.')
  }

  const response = await fetch(`${API_BASE_URL}/certificates/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof data?.detail === 'string'
        ? data.detail
        : `Could not load certificates (HTTP ${response.status}).`

    throw new Error(message)
  }

  if (!Array.isArray(data)) {
    throw new Error('The certificates response was not a list.')
  }

  return data.map((certificate) => ({
    registrationId: certificate.registration_id,
    certificateId: certificate.certificate_id,
    participantFirstName: certificate.participant_first_name,
    participantLastName: certificate.participant_last_name,
    sessionTitle: certificate.session_title,
    sessionDate: certificate.session_date,
    issuedAt: certificate.issued_at,
  }))
}
export async function getCertificatePdf(registrationId, accessToken) {
  if (!registrationId || !accessToken) {
    throw new Error('A registration ID and login are required.')
  }

  const response = await fetch(
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
    const data = await response.json().catch(() => null)

    let message = `Could not download certificate (HTTP ${response.status}).`

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

  const contentType = response.headers.get('content-type') || ''

  if (!contentType.toLowerCase().includes('application/pdf')) {
    throw new Error(
      'The server did not return a PDF. Please confirm the response format with the backend developer.'
    )
  }

  const pdf = await response.blob()

  if (pdf.size === 0) {
    throw new Error('The server returned an empty PDF.')
  }

  return pdf
}