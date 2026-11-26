import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getSessionSaveErrorMessage,
  INSTRUCTOR_NOT_FOUND_MESSAGE,
} from '../src/utils/sessionSaveError.js'

test('a 404 from create/update maps to the instructor-selection message', () => {
  assert.equal(
    getSessionSaveErrorMessage({ status: 404, message: 'Not Found' }),
    INSTRUCTOR_NOT_FOUND_MESSAGE
  )
})

test('other backend errors keep their message', () => {
  assert.equal(
    getSessionSaveErrorMessage({
      status: 422,
      message: 'target_age_category_ids: value is not a valid list',
    }),
    'target_age_category_ids: value is not a valid list'
  )
})

test('a missing error message has a safe fallback', () => {
  assert.match(getSessionSaveErrorMessage(null), /Could not save the session/)
})
