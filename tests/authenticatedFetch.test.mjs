import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedFetch } from '../src/api/authenticatedFetch.js'

test('concurrent 401s share one refresh and both retry', async () => {
  let accessToken = 'old-test-token'
  let refreshCount = 0
  let initialRequestCount = 0
  let retryCount = 0

  let releaseRefresh
  const refreshGate = new Promise((resolve) => {
    releaseRefresh = resolve
  })

  let signalRefreshStarted
  const refreshStarted = new Promise((resolve) => {
    signalRefreshStarted = resolve
  })

  const request = createAuthenticatedFetch({
    getAccessToken: () => accessToken,
    getSessionId: () => 1,

    refreshSession: async () => {
      refreshCount += 1
      signalRefreshStarted()

      await refreshGate
      accessToken = 'new-test-token'
    },

    fetchImpl: async (_url, options) => {
      const authorization = options.headers.get('Authorization')

      if (authorization === 'Bearer old-test-token') {
        initialRequestCount += 1
        return new Response(null, { status: 401 })
      }

      assert.equal(authorization, 'Bearer new-test-token')
      retryCount += 1

      return new Response(null, { status: 200 })
    },
  })

  const resultsPromise = Promise.all([
    request('https://test.invalid/first'),
    request('https://test.invalid/second'),
  ])

  await refreshStarted

  assert.equal(initialRequestCount, 2)
  assert.equal(refreshCount, 1)
  assert.equal(retryCount, 0)

  releaseRefresh()

  const responses = await resultsPromise

  assert.equal(refreshCount, 1)
  assert.equal(retryCount, 2)
  assert.deepEqual(
    responses.map((response) => response.status),
    [200, 200]
  )
})

test('failed shared refresh rejects both requests without retrying', async () => {
  let refreshCount = 0
  let requestCount = 0

  const refreshError = new Error('Refresh token rejected.')
  refreshError.status = 401

  const request = createAuthenticatedFetch({
    getAccessToken: () => 'old-test-token',
    getSessionId: () => 1,

    refreshSession: async () => {
      refreshCount += 1
      throw refreshError
    },

    fetchImpl: async () => {
      requestCount += 1
      return new Response(null, { status: 401 })
    },
  })

  const results = await Promise.allSettled([
    request('https://test.invalid/first'),
    request('https://test.invalid/second'),
  ])

  assert.equal(refreshCount, 1)
  assert.equal(requestCount, 2)

  for (const result of results) {
    assert.equal(result.status, 'rejected')
    assert.equal(result.reason, refreshError)
  }
})

test('session change during refresh prevents retry', async () => {
  let sessionId = 1
  let requestCount = 0

  let releaseRefresh
  const refreshGate = new Promise((resolve) => {
    releaseRefresh = resolve
  })

  let signalRefreshStarted
  const refreshStarted = new Promise((resolve) => {
    signalRefreshStarted = resolve
  })

  const request = createAuthenticatedFetch({
    getAccessToken: () => 'test-token',
    getSessionId: () => sessionId,

    refreshSession: async () => {
      signalRefreshStarted()
      await refreshGate
    },

    fetchImpl: async () => {
      requestCount += 1
      return new Response(null, { status: 401 })
    },
  })

  const rejectionCheck = assert.rejects(
    request('https://test.invalid/session'),
    /The login session changed/
  )

  await refreshStarted

  sessionId = 2
  releaseRefresh()

  await rejectionCheck

  assert.equal(requestCount, 1)
})

test('a second 401 is returned without another refresh', async () => {
  let accessToken = 'old-test-token'
  let refreshCount = 0
  let requestCount = 0
  const sentTokens = []

  const request = createAuthenticatedFetch({
    getAccessToken: () => accessToken,
    getSessionId: () => 1,

    refreshSession: async () => {
      refreshCount += 1
      accessToken = 'new-test-token'
    },

    fetchImpl: async (_url, options) => {
      requestCount += 1
      sentTokens.push(options.headers.get('Authorization'))

      return new Response(null, { status: 401 })
    },
  })

  const response = await request('https://test.invalid/session')

  assert.equal(response.status, 401)
  assert.equal(refreshCount, 1)
  assert.equal(requestCount, 2)
  assert.deepEqual(sentTokens, [
    'Bearer old-test-token',
    'Bearer new-test-token',
  ])
})