import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './AttendanceValidationPage.css'
import ManagerHeader from '../components/ManagerHeader'
import {
  getManagementSession,
  validateSessionAttendance,
} from '../api/sessions'
import { getSessionStatus } from '../utils/sessionStatus'

export default function AttendanceValidationPage({
  accessToken,
  onLogout,
  onAttendanceValidated,
}) {
  const { sessionId } = useParams()

  const [detail, setDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      setIsLoading(true)
      setLoadError('')

      try {
        const data = await getManagementSession(sessionId, accessToken)

        if (isActive) {
          setDetail(data)
          setSelectedIds([])
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      isActive = false
    }
  }, [sessionId, accessToken])

  async function reloadDetail() {
    const data = await getManagementSession(sessionId, accessToken)
    setDetail(data)
    setSelectedIds([])
  }

  const attendees = detail?.attendees ?? []
  const attendedAttendees = attendees.filter((attendee) => attendee.hasAttended)
  const pendingAttendees = attendedAttendees.filter(
    (attendee) => !attendee.attendanceValidated
  )
  const validatedAttendees = attendedAttendees.filter(
    (attendee) => attendee.attendanceValidated
  )
  const isCompleted = detail
    ? getSessionStatus(detail, new Date()) === 'COMPLETED'
    : false

  const allPendingSelected =
    pendingAttendees.length > 0 &&
    selectedIds.length === pendingAttendees.length

  function toggleAttendee(registrationId) {
    setSelectedIds((current) =>
      current.includes(registrationId)
        ? current.filter((id) => id !== registrationId)
        : [...current, registrationId]
    )
    setActionError('')
  }

  function toggleAllPending() {
    setSelectedIds(
      allPendingSelected
        ? []
        : pendingAttendees.map((attendee) => attendee.registrationId)
    )
    setActionError('')
  }

  async function handleValidateSelected() {
    if (isSubmitting) {
      return
    }

    setActionError('')
    setActionMessage('')

    if (selectedIds.length === 0) {
      setActionError('Select at least one attendee to validate.')
      return
    }

    setIsSubmitting(true)

    try {
      const validatedCount = await validateSessionAttendance(
        sessionId,
        selectedIds,
        accessToken
      )

      setActionMessage(
        `${validatedCount} attendance record${
          validatedCount === 1 ? '' : 's'
        } validated. Certificates are now available to those participants.`
      )

      await reloadDetail()
      await onAttendanceValidated?.()
    } catch (error) {
      setActionError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ManagerHeader onLogout={onLogout} />

      <main className="attendance-validation">
        <header className="create-session__heading">
          <Link to="/manager">← Session management</Link>
          <h1>Attendance validation</h1>
          <p>{detail ? detail.title : 'Session'}</p>
        </header>

        {isLoading ? (
          <p>Loading attendance…</p>
        ) : loadError ? (
          <div>
            <p role="alert">{loadError}</p>
            <Link to="/manager">Back to session management</Link>
          </div>
        ) : !detail ? (
          <p>The requested session does not exist.</p>
        ) : (
          <>
            <dl className="attendance-summary">
              <div className="attendance-summary__item">
                <dt>Registered</dt>
                <dd>{detail.registeredCount}</dd>
              </div>

              <div className="attendance-summary__item">
                <dt>Attendance recorded</dt>
                <dd>{attendedAttendees.length}</dd>
              </div>

              <div className="attendance-summary__item">
                <dt>Validated</dt>
                <dd>{validatedAttendees.length}</dd>
              </div>

              <div className="attendance-summary__item">
                <dt>Absent</dt>
                <dd>{detail.absentCount}</dd>
              </div>
            </dl>

            {!isCompleted && (
              <p className="create-session__notice">
                Attendance is recorded automatically when a participant joins
                the session. Validation becomes available once the session is
                completed.
              </p>
            )}

            {actionError && (
              <p className="form-error" role="alert">
                {actionError}
              </p>
            )}

            {actionMessage && (
              <p className="form-success" role="status">
                {actionMessage}
              </p>
            )}

            {attendedAttendees.length === 0 ? (
              <p>
                No attendance has been recorded for this session yet. A
                participant is marked as attended when they open the session
                from “My sessions”.
              </p>
            ) : (
              <>
                {isCompleted && pendingAttendees.length > 0 && (
                  <div className="attendance-toolbar">
                    <label className="attendance-toolbar__select-all">
                      <input
                        type="checkbox"
                        checked={allPendingSelected}
                        onChange={toggleAllPending}
                        disabled={isSubmitting}
                      />
                      <span>
                        Select all pending ({pendingAttendees.length})
                      </span>
                    </label>

                    <button
                      type="button"
                      className="attendance-toolbar__validate"
                      onClick={handleValidateSelected}
                      disabled={isSubmitting || selectedIds.length === 0}
                    >
                      {isSubmitting
                        ? 'Validating…'
                        : `Validate selected (${selectedIds.length})`}
                    </button>
                  </div>
                )}

                <ul className="attendance-list">
                  {attendees.map((attendee) => {
                    const isSelectable =
                      isCompleted &&
                      attendee.hasAttended &&
                      !attendee.attendanceValidated

                    const statusLabel = attendee.attendanceValidated
                      ? 'Validated'
                      : attendee.hasAttended
                        ? 'Pending validation'
                        : 'Did not attend'

                    const statusClass = attendee.attendanceValidated
                      ? 'attendance-list__status--validated'
                      : attendee.hasAttended
                        ? 'attendance-list__status--pending'
                        : 'attendance-list__status--absent'

                    return (
                      <li
                        className="attendance-list__item"
                        key={attendee.registrationId}
                      >
                        <div className="attendance-list__details">
                          <label className="attendance-list__select">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(
                                attendee.registrationId
                              )}
                              onChange={() =>
                                toggleAttendee(attendee.registrationId)
                              }
                              disabled={!isSelectable || isSubmitting}
                              aria-label={`Select ${attendee.fullName} for attendance validation`}
                            />
                            <span className="attendance-list__name">
                              {attendee.fullName}
                            </span>
                          </label>

                          <span
                            className={`attendance-list__status ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}

            <p className="attendance-validation__hint">
              Validating attendance issues the participant&apos;s certificate;
              they can then download it from their profile.
            </p>
          </>
        )}
      </main>
    </>
  )
}
