export const INSTRUCTOR_NOT_FOUND_MESSAGE =
  'Selected instructor no longer exists. Please choose another instructor.'

/**
 * Maps a failed create/update save to the message shown in the form.
 * A 404 from these endpoints means the selected instructor disappeared
 * between loading the roster and submitting; the manager must pick another.
 */
export function getSessionSaveErrorMessage(error) {
  if (error?.status === 404) {
    return INSTRUCTOR_NOT_FOUND_MESSAGE
  }

  return error?.message || 'Could not save the session. Please try again.'
}
