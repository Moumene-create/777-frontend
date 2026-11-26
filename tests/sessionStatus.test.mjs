import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getJoinWindow,
  getMySessionDisplayState,
  getSessionBadgeStatus,
  getSessionStatus,
  isBeforeRegistrationCutoff,
  isJoinWindowOpen,
  isSessionFull,
  sortSessionsForDisplay,
} from '../src/utils/sessionStatus.js'

function session(overrides = {}) {
  return {
    id: 'session-1',
    date: '2026-11-23',
    startTime: '14:00:00',
    startDateTime: new Date('2026-11-23T14:00:00'),
    durationMinutes: 60,
    maxCapacity: 100,
    registeredCount: 20,
    status: 'OPEN',
    isCancelled: false,
    ...overrides,
  }
}

const at = (time) => new Date(`2026-11-23T${time}`)

test('status follows the clock even when the fetched snapshot is stale', () => {
  const sessionBeforeStart = session({ status: 'OPEN' })
  const sessionRunning = session({ status: 'OPEN' })

  assert.equal(getSessionStatus(sessionBeforeStart, at('13:30:00')), 'OPEN')
  assert.equal(getSessionStatus(sessionRunning, at('14:30:00')), 'RUNNING')
  assert.equal(getSessionStatus(session({ status: 'RUNNING' }), at('15:30:00')), 'COMPLETED')
})

test('server status is the fallback when the window is unknown', () => {
  const noWindow = session({
    startDateTime: null,
    date: '',
    startTime: '',
    status: 'RUNNING',
  })

  assert.equal(getSessionStatus(noWindow, at('10:00:00')), 'RUNNING')
})

test('cancelled is a stored override', () => {
  assert.equal(getSessionStatus(session({ isCancelled: true }), at('10:00:00')), 'CANCELLED')
  assert.equal(getSessionStatus(session({ status: 'CANCELLED' }), at('10:00:00')), 'CANCELLED')
})

test('computes OPEN/COMPLETED from the clock when status is missing', () => {
  const unknown = session({ status: null })
  const completed = session({ status: null })

  assert.equal(getSessionStatus(unknown, at('10:00:00')), 'OPEN')
  assert.equal(getSessionStatus(completed, at('15:30:00')), 'COMPLETED')
})

test('FULL is derived from capacity and never overrides RUNNING', () => {
  const full = session({ registeredCount: 100 })
  const runningFull = session({ status: 'RUNNING', registeredCount: 100 })

  assert.equal(isSessionFull(full), true)
  assert.equal(getSessionBadgeStatus(full, at('10:00:00')), 'FULL')
  assert.equal(getSessionBadgeStatus(runningFull, at('14:30:00')), 'RUNNING')
})

test('registration closes exactly one hour before the start', () => {
  const upcoming = session()

  assert.equal(isBeforeRegistrationCutoff(upcoming, at('12:59:59')), true)
  assert.equal(isBeforeRegistrationCutoff(upcoming, at('13:00:00')), false)
})

test('join window opens at T-60 and closes at the session end', () => {
  const upcoming = session()

  assert.equal(isJoinWindowOpen(upcoming, at('12:59:59')), false)
  assert.equal(isJoinWindowOpen(upcoming, at('13:00:00')), true)
  assert.equal(isJoinWindowOpen(upcoming, at('14:30:00')), true)
  assert.equal(isJoinWindowOpen(upcoming, at('15:00:00')), false)
  assert.equal(
    isJoinWindowOpen(session({ isCancelled: true }), at('13:30:00')),
    false
  )
})

test('join window exposes the opening time for the UI hint', () => {
  const window = getJoinWindow(session())

  assert.equal(window.opensAt.getHours(), 13)
  assert.equal(window.opensAt.getMinutes(), 0)
  assert.equal(window.closesAt.getHours(), 15)
})

test('My Sessions display states prefer registration_state', () => {
  const attended = session({ registrationState: 'attended', status: 'COMPLETED' })
  const absent = session({ registrationState: 'absent', status: 'COMPLETED' })
  const registered = session({ registrationState: 'registered' })
  const oddState = session({ registrationState: 'waiting_list' })

  assert.equal(getMySessionDisplayState(attended, at('16:00:00')), 'Attended')
  assert.equal(getMySessionDisplayState(absent, at('16:00:00')), 'Absent')
  assert.equal(getMySessionDisplayState(registered, at('10:00:00')), 'Registered')
  assert.equal(getMySessionDisplayState(oddState, at('10:00:00')), 'Waiting list')
  assert.equal(
    getMySessionDisplayState(session({ status: 'COMPLETED' }), at('16:00:00')),
    'Completed'
  )
  assert.equal(
    getMySessionDisplayState(session({ isCancelled: true }), at('10:00:00')),
    'Cancelled'
  )
})

test('sessions are sorted OPEN -> RUNNING -> FULL -> COMPLETED', () => {
  const open = session({
    id: 'open',
    startDateTime: new Date('2026-11-24T10:00:00'),
  })
  const running = session({
    id: 'running',
    startDateTime: new Date('2026-11-23T09:30:00'),
  })
  const full = session({
    id: 'full',
    startDateTime: new Date('2026-11-25T10:00:00'),
    registeredCount: 100,
  })
  const completed = session({
    id: 'completed',
    startDateTime: new Date('2026-11-23T08:00:00'),
  })

  const sorted = sortSessionsForDisplay(
    [completed, full, running, open],
    at('10:00:00')
  )

  assert.deepEqual(
    sorted.map((item) => item.id),
    ['open', 'running', 'full', 'completed']
  )
})
