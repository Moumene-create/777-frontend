function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function nullableText(value) {
  const cleaned = text(value)
  return cleaned === '' ? null : cleaned
}

/**
 * Resolves the backend-relative photo URL against the backend origin.
 * `apiBaseUrl` may contain a path; only its origin is used, never `/api`.
 */
export function resolveInstructorPhotoUrl(photoUrl, apiBaseUrl) {
  const value = text(photoUrl)

  if (!value) {
    return null
  }

  try {
    const backendOrigin = new URL(apiBaseUrl).origin
    return new URL(value, `${backendOrigin}/`).href
  } catch {
    return null
  }
}

/**
 * Manager-facing `InstructorListItemResponse`.
 * Includes email and phone; these must never be sent to public cards.
 */
export function normalizeInstructor(raw, { baseUrl = '' } = {}) {
  const instructor = raw ?? {}
  const firstName = text(instructor.first_name)
  const lastName = text(instructor.last_name)
  const photoUrl = nullableText(instructor.photo_url)

  return {
    id: instructor.id ?? null,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    email: nullableText(instructor.email),
    phone: nullableText(instructor.phone),
    bio: nullableText(instructor.bio),
    photoUrl,
    photoSrc: resolveInstructorPhotoUrl(photoUrl, baseUrl),
    isFeatured: instructor.is_featured === true,
  }
}

/**
 * Public `PublicInstructorListItemResponse`.
 * Deliberately has no email or phone properties.
 */
export function normalizePublicInstructor(raw, { baseUrl = '' } = {}) {
  const instructor = raw ?? {}
  const firstName = text(instructor.first_name)
  const lastName = text(instructor.last_name)
  const photoUrl = nullableText(instructor.photo_url)

  return {
    id: instructor.id ?? null,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    bio: nullableText(instructor.bio),
    photoUrl,
    photoSrc: resolveInstructorPhotoUrl(photoUrl, baseUrl),
  }
}

/**
 * Builds the create/update body. Both endpoints accept/require the same
 * field names; update additionally requires `is_featured`, which the form
 * always supplies as a boolean.
 */
export function buildInstructorPayload(values) {
  return {
    first_name: text(values?.firstName),
    last_name: text(values?.lastName),
    email: nullableText(values?.email),
    phone: nullableText(values?.phone),
    bio: nullableText(values?.bio),
    is_featured: values?.isFeatured === true,
  }
}

export function validateInstructorForm(values) {
  const errors = {}
  const firstName = text(values?.firstName)
  const lastName = text(values?.lastName)
  const email = text(values?.email)
  const phone = text(values?.phone)
  const bio = text(values?.bio)

  if (!firstName) {
    errors.firstName = 'First name is required.'
  } else if (firstName.length > 100) {
    errors.firstName = 'First name must be 100 characters or fewer.'
  }

  if (!lastName) {
    errors.lastName = 'Last name is required.'
  } else if (lastName.length > 100) {
    errors.lastName = 'Last name must be 100 characters or fewer.'
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (phone.length > 30) {
    errors.phone = 'Phone must be 30 characters or fewer.'
  }

  if (bio.length > 2000) {
    errors.bio = 'Bio must be 2000 characters or fewer.'
  }

  return errors
}

export const INSTRUCTOR_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const INSTRUCTOR_PHOTO_MAX_BYTES = 5 * 1024 * 1024

/**
 * Client-side mirror of the backend photo rules, for faster feedback.
 * Returns an error message or an empty string.
 */
export function validateInstructorPhoto(file) {
  if (!file) {
    return 'Choose a photo to upload.'
  }

  if (!INSTRUCTOR_PHOTO_TYPES.includes(String(file.type).toLowerCase())) {
    return 'Unsupported image type. Allowed types are image/jpeg, image/png, and image/webp.'
  }

  if (file.size > INSTRUCTOR_PHOTO_MAX_BYTES) {
    return 'The uploaded photo exceeds the 5 MB limit.'
  }

  return ''
}
