import test from 'node:test'
import assert from 'node:assert/strict'
import { getInstructorAvatar } from '../src/utils/instructorAvatar.js'

test('the same instructor always gets the same avatar', () => {
  const first = getInstructorAvatar('Amina Belkacem')
  const second = getInstructorAvatar('Amina Belkacem')

  assert.equal(first, second)
  assert.match(first, /^data:image\/svg\+xml/)
})

test('different instructors get different avatars', () => {
  const amina = getInstructorAvatar('Amina Belkacem')
  const yacine = getInstructorAvatar('Yacine Haddad')

  assert.notEqual(amina, yacine)
})

test('names are escaped in the SVG label', () => {
  const avatar = getInstructorAvatar('A <b> & "B"')

  assert.equal(avatar.includes('<b>'), false)
  assert.ok(avatar.startsWith('data:image/svg+xml'))
})
