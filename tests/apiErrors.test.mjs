import test from 'node:test'
import assert from 'node:assert/strict'
import { isAuthError, readErrorResponse } from '../src/api/errors.js'

function jsonResponse(body, status = 422) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test('maps FastAPI validation errors to a readable message', async () => {
  const error = await readErrorResponse(
    jsonResponse({
      detail: [
        { loc: ['body', 'title'], msg: 'Field required', type: 'missing' },
        { loc: ['body', 'start_time'], msg: 'Invalid time', type: 'time' },
      ],
    }),
    'Fallback message'
  )

  assert.equal(error.status, 422)
  assert.equal(error.message, 'title: Field required\nstart_time: Invalid time')
  assert.equal(error.name, 'ApiError')
})

test('maps a string detail from the API', async () => {
  const error = await readErrorResponse(
    jsonResponse({ detail: 'You are already registered.' }, 409),
    'Fallback message'
  )

  assert.equal(error.status, 409)
  assert.equal(error.message, 'You are already registered.')
})

test('understands the SRS error envelope if the backend adds it', async () => {
  const error = await readErrorResponse(
    jsonResponse(
      {
        error: {
          code: 'SESSION_FULL',
          message: 'This session has reached its maximum capacity.',
        },
      },
      409
    ),
    'Fallback message'
  )

  assert.equal(error.code, 'SESSION_FULL')
  assert.equal(error.message, 'This session has reached its maximum capacity.')
})

test('falls back when the body is not JSON', async () => {
  const error = await readErrorResponse(
    new Response('<html>Bad gateway</html>', { status: 502 }),
    'Fallback message'
  )

  assert.equal(error.status, 502)
  assert.equal(error.message, 'Fallback message')
})

test('isAuthError detects 401 responses', async () => {
  const error = await readErrorResponse(
    jsonResponse({ detail: 'Not authenticated' }, 401),
    'Fallback'
  )

  assert.equal(isAuthError(error), true)
  assert.equal(isAuthError(new Error('other')), false)
})
