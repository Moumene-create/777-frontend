import { useEffect, useRef } from 'react'
import './CancelSessionDialog.css'

export default function CancelSessionDialog({
  session,
  onClose,
}) {
  const dialogRef = useRef(null)

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
        onClose()
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

      

      <div className="cancel-session-dialog__actions">
        <button type="button" onClick={onClose} autoFocus>
          Keep session
        </button>

        <button type="button" disabled>
          Confirm cancellation
        </button>
      </div>
    </dialog>
  )
}