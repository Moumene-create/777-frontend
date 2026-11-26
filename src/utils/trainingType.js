/**
 * Normalises a `TrainingTypeListItemResponse`.
 * The API now includes the shared training-type description.
 */
export function normalizeTrainingType(raw) {
  const training = raw ?? {}

  return {
    id: training.id ?? null,
    trainingCode:
      typeof training.training_code === 'string' ? training.training_code : '',
    name: typeof training.name === 'string' ? training.name : '',
    description:
      typeof training.description === 'string'
        ? training.description.trim()
        : '',
  }
}
