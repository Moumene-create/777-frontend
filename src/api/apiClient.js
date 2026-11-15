let authenticatedRequest = null

export function configureApiClient(request) {
  authenticatedRequest = request

  return () => {
    if (authenticatedRequest === request) {
      authenticatedRequest = null
    }
  }
}

export function apiFetch(url, options) {
  if (!authenticatedRequest) {
    return fetch(url, options)
  }

  return authenticatedRequest(url, options)
}