import { useEffect, useRef, useState } from 'react'
import './CancelSessionDialog.css'

export default function CancelSessionDialog({
  session,
  onClose,
  onConfirm,
}) {
  const dialogRef = useRef(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    if (isCancelling || !onConfirm) return

    setIsCancelling(true)
    setError('')

    try {
      await onConfirm(session.id)
      onClose()
    } catch (error) {
      setError(error.message)
      setIsCancelling(false)
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current

    dialog.showModal()

    return () => {
      dialog.close()
    }
  }, [])

  return (
    <dialog
    ref={dialogRef}
    className="cancel-session-dialog"
    aria-labelledby="cancel-session-title"
    aria-describedby="cancel-session-description"
    onCancel={(event) => {
      event.preventDefault()

      if (!isCancelling) {
        onClose()
      }
    }}
    >
      <h2 id="cancel-session-title">Cancel session?</h2>

      <p id="cancel-session-description">
        You are about to cancel “{session.title}”.
      </p>

      <ul>
        <li>Participants will no longer be able to join.</li>
        <li>Registration and unregistration will be disabled.</li>
        <li>Registered participants will be notified by email.</li>
        <li>The session will remain visible as cancelled.</li>
      </ul>

      

      {error && <p role="alert">{error}</p>}

      <div className="cancel-session-dialog__actions">
        <button
          type="button"
          onClick={onClose}
          disabled={isCancelling}
          autoFocus
        >
          Keep session
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isCancelling || !onConfirm}
        >
          {isCancelling ? 'Cancelling...' : 'Confirm cancellation'}
        </button>
      </div>
    </dialog>
  )
}