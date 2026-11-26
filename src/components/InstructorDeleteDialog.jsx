import { useEffect, useRef, useState } from 'react'
import './CancelSessionDialog.css'
import './InstructorDeleteDialog.css'

export default function InstructorDeleteDialog({
  instructor,
  onClose,
  onConfirm,
}) {
  const dialogRef = useRef(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current

    dialog.showModal()

    return () => {
      dialog.close()
    }
  }, [])

  async function handleConfirm() {
    if (isDeleting || !onConfirm) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await onConfirm(instructor.id)
      onClose()
    } catch (deleteError) {
      setError(deleteError.message)
      setIsDeleting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="cancel-session-dialog instructor-delete-dialog"
      aria-labelledby="instructor-delete-title"
      aria-describedby="instructor-delete-description"
      onCancel={(event) => {
        event.preventDefault()

        if (!isDeleting) {
          onClose()
        }
      }}
    >
      <h2 id="instructor-delete-title">Delete instructor?</h2>

      <p id="instructor-delete-description">
        You are about to delete “{instructor.fullName}”. This cannot be undone.
      </p>

      <p>
        Instructors assigned to sessions cannot be deleted. You can still
        feature or unfeature them.
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="cancel-session-dialog__actions">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          autoFocus
        >
          Keep instructor
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting || !onConfirm}
        >
          {isDeleting ? 'Deleting…' : 'Delete instructor'}
        </button>
      </div>
    </dialog>
  )
}
