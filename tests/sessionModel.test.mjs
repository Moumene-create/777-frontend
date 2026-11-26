import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSessionStartDateTime,
  normalizeManagedSession,
  normalizeManagementSession,
  normalizeMySession,
  normalizeSession,
} from '../src/utils/sessionModel.js'

const listItem = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Introduction to AI',
  description: 'Beginner session',
  training_type_description: 'Artificial Intelligence',
  prerequisites: 'None',
  date: '2026-11-15',
  start_time: '14:00:00',
  duration_minutes: 90,
  max_capacity: 100,
  registered_count: 23,
  instructor_name: 'Frihaoui Mohammed',
  is_cancelled: false,
  status: 'OPEN',
}

test('normalizeSession maps the participant list item', () => {
  const session = normalizeSession(listItem)

  assert.equal(session.id, listItem.id)
  assert.equal(session.title, 'Introduction to AI')
  assert.equal(session.trainingTypeDescription, 'Artificial Intelligence')
  assert.equal(session.prerequisites, 'None')
  assert.equal(session.startTime, '14:00:00')
  assert.equal(session.durationMinutes, 90)
  assert.equal(session.maxCapacity, 100)
  assert.equal(session.registeredCount, 23)
  assert.equal(session.instructorName, 'Frihaoui Mohammed')
  assert.equal(session.isCancelled, false)
  assert.equal(session.status, 'OPEN')
  assert.equal(session.startDateTime instanceof Date, true)
  assert.equal(session.startDateTime.getHours(), 14)
})

test('normalizeSession tolerates missing optional fields', () => {
  const session = normalizeSession({
    id: 'x',
    title: 'Title',
    description: 'Description',
    date: '2026-01-01',
    start_time: '09:00:00',
    duration_minutes: 60,
    max_capacity: 10,
    registered_count: 0,
    instructor_name: '',
    is_cancelled: true,
    status: 'CANCELLED',
  })

  assert.equal(session.trainingTypeDescription, null)
  assert.equal(session.prerequisites, null)
  assert.equal(session.isCancelled, true)
  assert.equal(session.status, 'CANCELLED')
})

test('normalizeMySession keeps the registration relationship', () => {
  const session = normalizeMySession({
    ...listItem,
    registration_id: '22222222-2222-2222-2222-222222222222',
    registration_state: 'attended',
    registered_at: '2026-11-01T10:00:00Z',
  })

  assert.equal(session.registrationId, '22222222-2222-2222-2222-222222222222')
  assert.equal(session.registrationState, 'attended')
  assert.equal(session.registeredAt, '2026-11-01T10:00:00Z')
  assert.equal(session.title, 'Introduction to AI')
})

test('normalizeManagedSession maps the management list item', () => {
  const managed = normalizeManagedSession({
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Security basics',
    date: '2026-12-01',
    start_time: '10:00:00',
    duration_minutes: 60,
    max_capacity: 50,
    registered_count: 12,
    instructor_id: '44444444-4444-4444-4444-444444444444',
    instructor_name: '7.77 Security Team',
    status: 'OPEN',
    target_age_category_ids: [4, 5],
  })

  assert.equal(managed.instructorId, '44444444-4444-4444-4444-444444444444')
  assert.equal(managed.instructorName, '7.77 Security Team')
  assert.deepEqual(managed.targetAgeCategoryIds, [4, 5])
  assert.equal(managed.registeredCount, 12)
})

test('normalizeManagementSession includes counts, zoom and attendees', () => {
  const detail = normalizeManagementSession({
    id: '55555555-5555-5555-5555-555555555555',
    training_id: '66666666-6666-6666-6666-666666666666',
    title: 'Session',
    description: 'Description',
    date: '2026-12-01',
    start_time: '10:00:00',
    duration_minutes: 60,
    max_capacity: 50,
    registered_count: 12,
    attended_count: 9,
    absent_count: 3,
    zoom_url: 'https://zoom.example/j/123',
    instructor_id: '77777777-7777-7777-7777-777777777777',
    instructor_name: 'Instructor',
    is_cancelled: false,
    target_age_category_ids: [4],
    prerequisites: 'Bring a laptop',
    attendees: [
      {
        registration_id: '88888888-8888-8888-8888-888888888888',
        first_name: 'Amine',
        last_name: 'B',
        has_attended: true,
        attendance_validated: false,
      },
    ],
  })

  assert.equal(detail.attendedCount, 9)
  assert.equal(detail.absentCount, 3)
  assert.equal(detail.zoomUrl, 'https://zoom.example/j/123')
  assert.equal(detail.prerequisites, 'Bring a laptop')
  assert.equal(detail.attendees.length, 1)
  assert.equal(detail.attendees[0].fullName, 'Amine B')
  assert.equal(detail.attendees[0].hasAttended, true)
  assert.equal(detail.attendees[0].attendanceValidated, false)
})

test('buildSessionStartDateTime rejects invalid input', () => {
  assert.equal(buildSessionStartDateTime('', ''), null)
  assert.equal(buildSessionStartDateTime('2026-11-15', 'not-a-time'), null)
  assert.equal(
    buildSessionStartDateTime('2026-11-15', '14:00:00') instanceof Date,
    true
  )
})
