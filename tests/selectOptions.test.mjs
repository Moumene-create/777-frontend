import test from 'node:test'
import assert from 'node:assert/strict'
import { filterSelectOptions } from '../src/utils/selectOptions.js'

const options = [
  { value: '1', label: 'Amine Benali' },
  { value: '2', label: 'Sara Haddad' },
  { value: '3', label: 'AI Basics' },
]

test('filterSelectOptions searches labels case-insensitively', () => {
  assert.deepEqual(
    filterSelectOptions(options, ' am ').map((option) => option.value),
    ['1']
  )
  assert.deepEqual(
    filterSelectOptions(options, 'SAR').map((option) => option.value),
    ['2']
  )
})

test('filterSelectOptions returns all options for an empty query', () => {
  assert.equal(filterSelectOptions(options, '   ').length, options.length)
  assert.equal(filterSelectOptions(options, 'zzz').length, 0)
})
