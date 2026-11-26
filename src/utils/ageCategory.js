// Single source of truth for the seven age categories exposed by the backend
// (`age_category_id` 1..7). Keep the ids in sync with the API.
export const AGE_CATEGORIES = [
  { id: 1, label: '7-10', minAge: 7, maxAge: 10 },
  { id: 2, label: '11-14', minAge: 11, maxAge: 14 },
  { id: 3, label: '15-17', minAge: 15, maxAge: 17 },
  { id: 4, label: '18-23', minAge: 18, maxAge: 23 },
  { id: 5, label: '24-30', minAge: 24, maxAge: 30 },
  { id: 6, label: '31-45', minAge: 31, maxAge: 45 },
  { id: 7, label: '46-60', minAge: 46, maxAge: 60 },
]

const AGE_CATEGORY_BY_ID = new Map(
  AGE_CATEGORIES.map((category) => [category.id, category])
)

const AGE_CATEGORY_BY_LABEL = new Map(
  AGE_CATEGORIES.map((category) => [category.label, category])
)

export function getAgeCategories() {
  return AGE_CATEGORIES
}

export function getAgeCategoryLabels() {
  return AGE_CATEGORIES.map((category) => category.label)
}

export function getAgeCategoryLabel(ageCategoryId) {
  const id = Number(ageCategoryId)
  return AGE_CATEGORY_BY_ID.get(id)?.label ?? null
}

export function getAgeCategoryId(label) {
  return AGE_CATEGORY_BY_LABEL.get(label)?.id ?? null
}

export function getAgeCategoryLabelsFromIds(ids) {
  if (!Array.isArray(ids)) {
    return []
  }

  return ids
    .map((id) => getAgeCategoryLabel(id))
    .filter((label) => label !== null)
}

/**
 * Derive the age category label from an ISO date of birth.
 * Returns null when the date is invalid or the person is outside 7-60.
 */
export function getAgeCategoryFromDateOfBirth(dateOfBirth) {
  if (typeof dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return null
  }

  const [year, month, day] = dateOfBirth.split('-').map(Number)
  const birthDate = new Date(year, month - 1, day)

  const isInvalidDate =
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day

  if (isInvalidDate || birthDate > new Date()) {
    return null
  }

  const today = new Date()
  let age = today.getFullYear() - year

  const birthdayHasNotPassed =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)

  if (birthdayHasNotPassed) {
    age -= 1
  }

  const category = AGE_CATEGORIES.find(
    (item) => age >= item.minAge && age <= item.maxAge
  )

  return category?.label ?? null
}
