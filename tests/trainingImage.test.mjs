import test from 'node:test'
import assert from 'node:assert/strict'
import { getTrainingImage } from '../src/utils/trainingImage.js'

test('the same training type always produces the same artwork', () => {
  const first = getTrainingImage(
    'Introduction to Artificial Intelligence',
    'Session in November'
  )
  const second = getTrainingImage(
    'Introduction to Artificial Intelligence',
    'Session in December'
  )

  assert.equal(first, second)
  assert.match(first, /^data:image\/svg\+xml/)
  assert.ok(first.length < 20_000)
})

test('different training types produce different artwork', () => {
  const ai = getTrainingImage('Introduction to Artificial Intelligence', 'AI')
  const security = getTrainingImage('Cybersecurity Basics', 'Security')
  const web = getTrainingImage('Introduction to Web Development', 'Web')

  assert.notEqual(ai, security)
  assert.notEqual(security, web)
})

test('falls back to the session title when no training type is provided', () => {
  const fromNull = getTrainingImage(null, 'Web Development')
  const fromEmpty = getTrainingImage('', 'Web Development')
  const fromMissing = getTrainingImage(undefined, 'Web Development')

  assert.equal(fromNull, fromEmpty)
  assert.equal(fromNull, fromMissing)
})

test('escapes training names safely inside the SVG', () => {
  const image = getTrainingImage('AI & "Robotics" <Intro>', 'Session')

  assert.equal(image.includes('<Intro>'), false)
  assert.ok(image.startsWith('data:image/svg+xml'))
})
