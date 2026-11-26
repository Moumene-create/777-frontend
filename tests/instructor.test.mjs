import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildInstructorPayload,
  INSTRUCTOR_PHOTO_MAX_BYTES,
  normalizeInstructor,
  normalizePublicInstructor,
  resolveInstructorPhotoUrl,
  validateInstructorForm,
  validateInstructorPhoto,
} from '../src/utils/instructor.js'

const managerRecord = {
  id: '0f1e2d3c-4b5a-6978-8901-23456789abcd',
  first_name: ' Amine ',
  last_name: ' Benali ',
  email: 'amine@example.com',
  phone: '0555123456',
  bio: 'Experienced trainer',
  photo_url: '/uploads/instructors/abc.jpg',
  is_featured: true,
}

test('normalizeInstructor maps every manager field and resolves the photo', () => {
  const instructor = normalizeInstructor(managerRecord, {
    baseUrl: 'http://10.42.0.1:8000/api',
  })

  assert.deepEqual(instructor, {
    id: managerRecord.id,
    firstName: 'Amine',
    lastName: 'Benali',
    fullName: 'Amine Benali',
    email: 'amine@example.com',
    phone: '0555123456',
    bio: 'Experienced trainer',
    photoUrl: '/uploads/instructors/abc.jpg',
    photoSrc: 'http://10.42.0.1:8000/uploads/instructors/abc.jpg',
    isFeatured: true,
  })
})

test('normalizeInstructor tolerates missing optional fields and names', () => {
  const instructor = normalizeInstructor({
    id: 'x',
    first_name: 'Amine',
  })

  assert.equal(instructor.fullName, 'Amine')
  assert.equal(instructor.email, null)
  assert.equal(instructor.phone, null)
  assert.equal(instructor.bio, null)
  assert.equal(instructor.photoUrl, null)
  assert.equal(instructor.photoSrc, null)
  assert.equal(instructor.isFeatured, false)
  assert.equal(normalizeInstructor({ id: 'x', last_name: 'Benali' }).fullName, 'Benali')
  assert.equal(normalizeInstructor({ id: 'x' }).fullName, '')
})

test('normalizePublicInstructor contains no manager contact fields', () => {
  const instructor = normalizePublicInstructor(
    {
      id: 'public-1',
      first_name: 'Sara',
      last_name: 'Haddad',
      bio: 'Public bio',
      photo_url: '/uploads/instructors/sara.webp',
    },
    { baseUrl: 'https://api.example.test' }
  )

  assert.equal(instructor.fullName, 'Sara Haddad')
  assert.equal(instructor.photoSrc, 'https://api.example.test/uploads/instructors/sara.webp')
  assert.equal('email' in instructor, false)
  assert.equal('phone' in instructor, false)
})

test('resolveInstructorPhotoUrl resolves against the backend origin, not the API path', () => {
  assert.equal(
    resolveInstructorPhotoUrl('/uploads/instructors/a.jpg', 'http://host:8000/api/v1'),
    'http://host:8000/uploads/instructors/a.jpg'
  )
  assert.equal(
    resolveInstructorPhotoUrl('uploads/instructors/a.jpg', 'http://host:8000'),
    'http://host:8000/uploads/instructors/a.jpg'
  )
  assert.equal(resolveInstructorPhotoUrl(null, 'http://host:8000'), null)
})

test('buildInstructorPayload supports names-only create payloads', () => {
  assert.deepEqual(
    buildInstructorPayload({ firstName: ' Amine ', lastName: ' Benali ' }),
    {
      first_name: 'Amine',
      last_name: 'Benali',
      email: null,
      phone: null,
      bio: null,
      is_featured: false,
    }
  )
})

test('buildInstructorPayload sends all update fields and clears empty optionals', () => {
  assert.deepEqual(
    buildInstructorPayload({
      firstName: 'Amine',
      lastName: 'Benali',
      email: ' ',
      phone: '',
      bio: '',
      isFeatured: true,
    }),
    {
      first_name: 'Amine',
      last_name: 'Benali',
      email: null,
      phone: null,
      bio: null,
      is_featured: true,
    }
  )
})

test('validateInstructorForm enforces backend field limits', () => {
  assert.equal(validateInstructorForm({}).firstName, 'First name is required.')
  assert.equal(validateInstructorForm({}).lastName, 'Last name is required.')
  assert.equal(
    validateInstructorForm({ firstName: 'A', lastName: 'B', email: 'invalid' })
      .email,
    'Enter a valid email address.'
  )
  assert.equal(
    validateInstructorForm({
      firstName: 'A'.repeat(101),
      lastName: 'B',
    }).firstName,
    'First name must be 100 characters or fewer.'
  )
  assert.equal(
    validateInstructorForm({
      firstName: 'A',
      lastName: 'B',
      phone: '1'.repeat(31),
    }).phone,
    'Phone must be 30 characters or fewer.'
  )
  assert.equal(
    validateInstructorForm({
      firstName: 'A',
      lastName: 'B',
      bio: 'x'.repeat(2001),
    }).bio,
    'Bio must be 2000 characters or fewer.'
  )
  assert.deepEqual(
    validateInstructorForm({
      firstName: 'A',
      lastName: 'B',
      email: 'a@example.com',
    }),
    {}
  )
})

test('validateInstructorPhoto mirrors type and size rules', () => {
  assert.match(validateInstructorPhoto(null), /Choose a photo/)
  assert.match(
    validateInstructorPhoto({ type: 'image/gif', size: 10 }),
    /Unsupported image type/
  )
  assert.match(
    validateInstructorPhoto({
      type: 'image/png',
      size: INSTRUCTOR_PHOTO_MAX_BYTES + 1,
    }),
    /exceeds the 5 MB limit/
  )
  assert.equal(
    validateInstructorPhoto({ type: 'image/jpeg', size: 1024 }),
    ''
  )
  assert.equal(
    validateInstructorPhoto({ type: 'image/webp', size: 1024 }),
    ''
  )
})

test('buildInstructorPayload sends all optional create fields', () => {
  assert.deepEqual(
    buildInstructorPayload({
      firstName: 'Amine',
      lastName: 'Benali',
      email: 'amine@example.com',
      phone: '0555123456',
      bio: 'Experienced trainer',
      isFeatured: true,
    }),
    {
      first_name: 'Amine',
      last_name: 'Benali',
      email: 'amine@example.com',
      phone: '0555123456',
      bio: 'Experienced trainer',
      is_featured: true,
    }
  )
})

test('feature toggling can submit is_featured false', () => {
  assert.equal(
    buildInstructorPayload({
      firstName: 'A',
      lastName: 'B',
      isFeatured: false,
    }).is_featured,
    false
  )
})
