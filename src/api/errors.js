/**
 * Shared API error type. The backend currently returns FastAPI's `detail`
 * shape (string or validation array) rather than the SRS error envelope;
 * this helper understands both so the UI never needs to string-match.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = null, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function messageFromDetail(detail) {
  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        const field = Array.isArray(item?.loc)
          ? item.loc.filter((part) => part !== 'body' && part !== 'path').join('.')
          : ''

        if (!item?.msg) {
          return ''
        }

        return field ? `${field}: ${item.msg}` : item.msg
      })
      .filter(Boolean)
      .join('\n')
  }

  if (detail && typeof detail === 'object' && typeof detail.message === 'string') {
    return detail.message
  }

  return ''
}

/**
 * Reads a failed `Response` into an `ApiError`, understanding both
 * `{ detail: … }` and `{ error: { code, message } }` envelopes.
 */
export async function readErrorResponse(response, fallbackMessage) {
  let body = null

  try {
    body = await response.json()
  } catch {
    // Non-JSON error body (proxy/HTML); fall back to the default message.
  }

  const envelope = body?.error

  const message =
    messageFromDetail(body?.detail) ||
    messageFromDetail(envelope) ||
    (typeof body?.message === 'string' ? body.message : '') ||
    (typeof envelope?.code === 'string' ? envelope.code : '') ||
    fallbackMessage

  return new ApiError(message, {
    status: response.status,
    code:
      (typeof envelope?.code === 'string' && envelope.code) ||
      (typeof body?.code === 'string' && body.code) ||
      null,
    details: body,
  })
}

export function isAuthError(error) {
  return error instanceof ApiError && error.status === 401
}
