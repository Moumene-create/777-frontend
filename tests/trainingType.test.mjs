import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeTrainingType } from '../src/utils/trainingType.js'

test('normalizeTrainingType keeps the shared training description', () => {
  assert.deepEqual(
    normalizeTrainingType({
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      training_code: 'AI101',
      name: 'AI Basics',
      description: '  Introduction to AI  ',
    }),
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      trainingCode: 'AI101',
      name: 'AI Basics',
      description: 'Introduction to AI',
    }
  )
})

test('normalizeTrainingType tolerates a null description', () => {
  const training = normalizeTrainingType({
    id: 'x',
    training_code: 'CODE',
    name: 'Name',
    description: null,
  })

  assert.equal(training.description, '')
})
