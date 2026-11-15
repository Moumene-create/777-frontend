export function createAuthenticatedFetch({
  getAccessToken,
  getSessionId,
  refreshSession,
}) {
  let pendingRefresh = null

  return async function authenticatedFetch(url, options = {}) {
    const sessionId = getSessionId()
    const originalToken = getAccessToken()

    function assertSameSession() {
      if (getSessionId() !== sessionId) {
        throw new Error('The login session changed. Request cancelled.')
      }
    }

    function sendRequest(token) {
      const headers = new Headers(options.headers)

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      } else {
        headers.delete('Authorization')
      }

      return fetch(url, {
        ...options,
        headers,
      })
    }

    const response = await sendRequest(originalToken)

    assertSameSession()

    if (response.status !== 401 || !originalToken) {
      return response
    }

    let nextToken = getAccessToken()

    if (nextToken === originalToken) {
      if (!pendingRefresh || pendingRefresh.sessionId !== sessionId) {
        const refresh = {
          sessionId,
          promise: null,
        }

        refresh.promise = Promise.resolve()
          .then(() => {
            assertSameSession()
            return refreshSession()
          })
          .finally(() => {
            if (pendingRefresh === refresh) {
              pendingRefresh = null
            }
          })

        pendingRefresh = refresh
      }

      await pendingRefresh.promise
      assertSameSession()

      nextToken = getAccessToken()
    }

    if (!nextToken) {
      throw new Error('Your session has ended. Please log in again.')
    }

    const retryResponse = await sendRequest(nextToken)

    assertSameSession()

    return retryResponse
  }
}