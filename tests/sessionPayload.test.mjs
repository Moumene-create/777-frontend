import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSessionPayload,
  toApiTime,
} from '../src/utils/sessionPayload.js'

const baseValues = {
  trainingMode: 'existing',
  trainingId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  title: '  Introduction to AI  ',
  description: '  Beginner session  ',
  date: '2026-11-15',
  time: '14:00',
  durationMinutes: '90',
  maxCapacity: '100',
  zoomUrl: ' https://zoom.example/j/123 ',
  prerequisites: '  ',
  targetAgeCategories: ['18-23', '24-30'],
  instructorId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
}

test('toApiTime produces the FastAPI time format', () => {
  assert.equal(toApiTime('14:00'), '14:00:00')
  assert.equal(toApiTime('14:00:30'), '14:00:30')
  assert.equal(toApiTime(''), '')
})

test('buildSessionPayload maps an existing training type', () => {
  const payload = buildSessionPayload(baseValues, { isEditing: false })

  assert.deepEqual(payload, {
    title: 'Introduction to AI',
    description: 'Beginner session',
    date: '2026-11-15',
    start_time: '14:00:00',
    duration_minutes: 90,
    max_capacity: 100,
    zoom_url: 'https://zoom.example/j/123',
    target_age_category_ids: [4, 5],
    prerequisites: null,
    instructor_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    training_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  })

  assert.equal(payload.instructor_name, undefined)
  assert.equal(payload.instructor_email, undefined)
  assert.equal(payload.instructor_phone, undefined)
  assert.equal('new_training_type' in payload, false)
})

test('buildSessionPayload maps an inline new training type', () => {
  const payload = buildSessionPayload(
    {
      ...baseValues,
      trainingMode: 'new',
      trainingId: '',
      newTrainingCode: ' AI-INTRO-001 ',
      newTrainingName: ' Introduction to AI ',
      newTrainingDescription: ' Foundations ',
    },
    { isEditing: false }
  )

  assert.equal(payload.training_id, undefined)
  assert.deepEqual(payload.new_training_type, {
    training_code: 'AI-INTRO-001',
    name: 'Introduction to AI',
    description: 'Foundations',
  })
})

test('buildSessionPayload omits the training type when editing', () => {
  const payload = buildSessionPayload(baseValues, { isEditing: true })

  assert.equal(payload.training_id, undefined)
  assert.equal(payload.new_training_type, undefined)
  assert.equal(payload.title, 'Introduction to AI')
})

test('buildSessionPayload rejects unknown or missing categories', () => {
  assert.throws(
    () =>
      buildSessionPayload(
        { ...baseValues, targetAgeCategories: [] },
        { isEditing: false }
      ),
    /at least one valid age category/
  )

  assert.throws(
    () =>
      buildSessionPayload(
        { ...baseValues, targetAgeCategories: ['61-77'] },
        { isEditing: false }
      ),
    /at least one valid age category/
  )
})

test('buildSessionPayload requires an instructor id', () => {
  assert.throws(
    () =>
      buildSessionPayload(
        { ...baseValues, instructorId: '' },
        { isEditing: false }
      ),
    /Select an instructor/
  )
})

test('the update payload contains the full instructor and schedule fields', () => {
  const payload = buildSessionPayload(baseValues, { isEditing: true })

  assert.equal(payload.instructor_id, baseValues.instructorId)
  assert.equal(payload.max_capacity, 100)
  assert.equal(payload.start_time, '14:00:00')
  assert.equal('training_id' in payload, false)
  assert.equal('new_training_type' in payload, false)
})
