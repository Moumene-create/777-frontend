import { getAgeCategoryId } from './ageCategory.js'

/**
 * Converts a form time value (`14:00`) to the `HH:MM:SS` shape FastAPI
 * expects for `time` fields.
 */
export function toApiTime(value) {
  if (typeof value !== 'string' || !value) {
    return ''
  }

  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value)

  if (!match) {
    return value
  }

  return `${match[1]}:${match[2]}:${match[3] ?? '00'}`
}

/**
 * Maps the SessionForm values to `SessionCreateRequest` / `SessionUpdateRequest`.
 * The live API uses `instructor_id` (UUID) and, on create, either an existing
 * `training_id` or an inline `new_training_type` — not the SRS's free-text
 * `instructor_name`.
 */
export function buildSessionPayload(values, { isEditing = false } = {}) {
  const labels = Array.isArray(values?.targetAgeCategories)
    ? values.targetAgeCategories
    : []

  const categoryIds = labels.map((label) => getAgeCategoryId(label))

  if (categoryIds.length === 0 || categoryIds.some((id) => id === null)) {
    throw new Error('Select at least one valid age category.')
  }

  const instructorId = String(values?.instructorId ?? '').trim()

  if (!instructorId) {
    throw new Error('Select an instructor.')
  }

  const payload = {
    title: String(values.title ?? '').trim(),
    description: String(values.description ?? '').trim(),
    date: values.date,
    start_time: toApiTime(values.time),
    duration_minutes: Number(values.durationMinutes),
    max_capacity: Number(values.maxCapacity),
    zoom_url: String(values.zoomUrl ?? '').trim(),
    target_age_category_ids: categoryIds,
    prerequisites: String(values.prerequisites ?? '').trim() || null,
    instructor_id: instructorId,
  }

  if (isEditing) {
    return payload
  }

  if (values.trainingMode === 'new') {
    payload.new_training_type = {
      training_code: String(values.newTrainingCode ?? '').trim(),
      name: String(values.newTrainingName ?? '').trim(),
      description:
        String(values.newTrainingDescription ?? '').trim() || null,
    }
  } else {
    payload.training_id = values.trainingId
  }

  return payload
}
