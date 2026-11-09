import { getAgeCategoryLabel } from './ageCategory'

export function normalizeBackendUser(backendUser) {
  if (!backendUser) {
    return null
  }

  const firstName = backendUser.first_name ?? ''
  const lastName = backendUser.last_name ?? ''

  return {
    id: backendUser.id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email: backendUser.email ?? '',
    phone: backendUser.phone_number ?? '',
    dateOfBirth: backendUser.date_of_birth ?? '',
    ageCategory: getAgeCategoryLabel(backendUser.age_category_id),
    wilaya: backendUser.wilaya ?? '',
    role: backendUser.role ==='SESSION_MANAGER'? ['PARTICIPANT', 'SESSION_MANAGER'] : ['PARTICIPANT'],
  }
}