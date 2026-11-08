export function calculateAgeCategory(dateOfBirth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth || '')) {
    throw new Error('Veuillez saisir une date de naissance valide.')
  }
  
  const [year, month, day] = dateOfBirth.split('-').map(Number)
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()

  const isInvalidDate =
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day

  if (isInvalidDate || birthDate > today) {
    throw new Error('Veuillez saisir une date de naissance valide.')
  }

  let age = today.getFullYear() - year

  const birthdayHasNotPassed =
    today.getMonth() < month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() < day)

  if (birthdayHasNotPassed) {
    age -= 1
  }

  const categories = [
    { min: 7, max: 10, label: '7-10' },
    { min: 11, max: 14, label: '11-14' },
    { min: 15, max: 17, label: '15-17' },
    { min: 18, max: 23, label: '18-23' },
    { min: 24, max: 30, label: '24-30' },
    { min: 31, max: 45, label: '31-45' },
    { min: 46, max: 60, label: '46-60' },
  ]

  return categories.find(
    (category) => age >= category.min && age <= category.max
  )?.label || null
}
const AGE_CATEGORY_ID_TO_LABEL = {
  1: '7-10',
  2: '11-14',
  3: '15-17',
  4: '18-23',
  5: '24-30',
  6: '31-45',
  7: '46-60',
}

export function getAgeCategoryLabel(ageCategoryId) {
  return AGE_CATEGORY_ID_TO_LABEL[ageCategoryId] ?? null
}