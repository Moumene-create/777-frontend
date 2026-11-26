import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatDuration,
  formatSessionDate,
  formatSessionTime,
} from '../src/utils/format.js'
import {
  getAgeCategoryFromDateOfBirth,
  getAgeCategoryId,
  getAgeCategoryLabel,
  getAgeCategoryLabels,
} from '../src/utils/ageCategory.js'

test('formatSessionDate renders the API date without timezone drift', () => {
  assert.equal(formatSessionDate('2026-11-15'), '15 Nov 2026')
  assert.equal(formatSessionDate(''), '')
  assert.equal(formatSessionDate('not-a-date'), 'not-a-date')
})

test('formatSessionTime trims seconds', () => {
  assert.equal(formatSessionTime('14:00:00'), '14:00')
  assert.equal(formatSessionTime('14:00'), '14:00')
  assert.equal(formatSessionTime(''), '')
})

test('formatDuration is human readable', () => {
  assert.equal(formatDuration(45), '45 min')
  assert.equal(formatDuration(60), '1 h')
  assert.equal(formatDuration(90), '1 h 30 min')
  assert.equal(formatDuration(0), '')
})

test('age category ids and labels round-trip', () => {
  assert.equal(getAgeCategoryLabel(4), '18-23')
  assert.equal(getAgeCategoryLabel(99), null)
  assert.equal(getAgeCategoryId('46-60'), 7)
  assert.equal(getAgeCategoryId('61-77'), null)
  assert.equal(getAgeCategoryLabels().length, 7)
})

test('age category is derived from the date of birth', () => {
  const now = new Date()
  const year = now.getFullYear() - 16
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(Math.min(now.getDate(), 28)).padStart(2, '0')

  assert.equal(
    getAgeCategoryFromDateOfBirth(`${year}-${month}-${day}`),
    '15-17'
  )
  assert.equal(getAgeCategoryFromDateOfBirth('not-a-date'), null)
  assert.equal(getAgeCategoryFromDateOfBirth('2999-01-01'), null)
})
