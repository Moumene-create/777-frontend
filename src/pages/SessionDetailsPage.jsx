import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './SessionDetailsPage.css'
import PublicHeader from '../components/PublicHeader'
import { getSessionById } from '../api/sessions'
import { useNow } from '../hooks/useNow'
import {
  formatDuration,
  formatSessionDate,
  formatSessionTime,
} from '../utils/format'
import {
  getSessionBadgeStatus,
  isBeforeRegistrationCutoff,
  isSessionFull,
} from '../utils/sessionStatus'

function SessionDetailsPage({
  registeredSessionIds,
  onRegister,
  onUnregister,
  isAuthenticated,
  currentUser,
  onLogout,
  accessToken,
}) {
  const { sessionId } = useParams()
  const now = useNow(15_000)

  const [session, setSession] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [isUpdatingRegistration, setIsUpdatingRegistration] = useState(false)
  const [registrationError, setRegistrationError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      setIsLoadingSession(true)
      setSessionError('')

      try {
        const loadedSession = await getSessionById(sessionId, accessToken)

        if (isActive) {
          setSession(loadedSession)
        }
      } catch (error) {
        if (isActive) {
          setSessionError(error.message)
        }
      } finally {
        if (isActive) {
          setIsLoadingSession(false)
        }
      }
    }

    loadSession()

    return () => {
      isActive = false
    }
  }, [sessionId, accessToken])

  async function refreshSession() {
    const updatedSession = await getSessionById(sessionId, accessToken)
    setSession(updatedSession)
  }

  async function handleRegistrationClick() {
    if (isUpdatingRegistration) {
      return
    }

    setIsUpdatingRegistration(true)
    setRegistrationError('')

    try {
      if (registeredSessionIds.includes(session.id)) {
        await onUnregister(session.id)
      } else {
        await onRegister(session.id)
      }

      try {
        await refreshSession()
      } catch {
        setRegistrationError(
          'Your registration was updated, but the latest session information could not be loaded. Please reload the page.'
        )
      }
    } catch (error) {
      setRegistrationError(
        error.message || 'Could not update your registration.'
      )
    } finally {
      setIsUpdatingRegistration(false)
    }
  }

  if (isLoadingSession) {
    return (
      <main className="session-details-page">
        <PublicHeader
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <p>Loading session…</p>
      </main>
    )
  }

  if (sessionError || !session) {
    return (
      <main className="session-details-page">
        <PublicHeader
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <h1>Session unavailable</h1>
        <p role="alert">{sessionError || 'This session could not be found.'}</p>
        <Link to="/sessions">Back to sessions</Link>
      </main>
    )
  }

  const isRegistered = registeredSessionIds.includes(session.id)
  const isFull = isSessionFull(session)
  const status = getSessionBadgeStatus(session, now)
  const isCancelled = status === 'CANCELLED'
  const isRegistrationOpen = isBeforeRegistrationCutoff(session, now)
  const isActionDisabled =
    isCancelled ||
    isUpdatingRegistration ||
    !isRegistrationOpen ||
    (isFull && !isRegistered)

  const buttonLabel = isCancelled
    ? 'Session cancelled'
    : isUpdatingRegistration
      ? 'Updating…'
      : isFull && !isRegistered
        ? 'Registration full'
        : !isRegistrationOpen
          ? isRegistered
            ? 'Cancellation closed'
            : 'Registration closed'
          : isRegistered
            ? 'Cancel registration'
            : 'Register'

  const statusLabel =
    status === 'FULL'
      ? 'Full'
      : status.charAt(0) + status.slice(1).toLowerCase()

  return (
    <main className="session-details-page">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <article className="session-details">
        <section className="session-details__main">
          <div className="session-details__heading">
            <h1 className="session-details__title">{session.title}</h1>
          </div>

          <p className="session-details__status-text">
            Session status: <strong>{statusLabel}</strong>
          </p>

          <p className="session-details__instructor">
            Instructor: {session.instructorName}
          </p>

          <section className="session-details__section">
            <h2>Description</h2>
            <p>{session.description}</p>
          </section>

          <section className="session-details__section">
            <h2>Prerequisites</h2>
            <p>{session.prerequisites ?? 'No prerequisites specified.'}</p>
          </section>
        </section>

        <aside
          className="session-ticket"
          aria-label="Session schedule and registration"
        >
          <div className="session-ticket__top">
            <div className="session-ticket__eyebrow">
              <span>7.77 · Session pass</span>
              <span>Admit one</span>
            </div>

            <p className="session-ticket__date">
              {formatSessionDate(session.date)}
            </p>

            <p className="session-ticket__time">
              {formatSessionTime(session.startTime)}
            </p>

            <dl className="session-ticket__meta">
              <div>
                <dt>Duration</dt>
                <dd>{formatDuration(session.durationMinutes)}</dd>
              </div>

              <div>
                <dt>Format</dt>
                <dd>Online</dd>
              </div>

              <div>
                <dt>Places filled</dt>
                <dd>
                  {session.registeredCount} / {session.maxCapacity}
                </dd>
              </div>
            </dl>
          </div>

          <div className="session-ticket__bottom">
            <span
              className="session-ticket__notch session-ticket__notch--left"
              aria-hidden="true"
            />
            <span
              className="session-ticket__notch session-ticket__notch--right"
              aria-hidden="true"
            />

            {isCancelled && (
              <p className="session-details__notice">
                This session has been cancelled. Registration and Zoom access
                are unavailable.
              </p>
            )}

            {registrationError && (
              <p className="form-error" role="alert">
                {registrationError}
              </p>
            )}

            <button
              type="button"
              className={`training-card__button ${
                isRegistered
                  ? 'training-card__button--registered'
                  : isFull
                    ? 'training-card__button--full'
                    : 'training-card__button--register'
              }`}
              onClick={handleRegistrationClick}
              disabled={isActionDisabled}
            >
              {buttonLabel}
            </button>

            <p className="session-details__cutoff-message">
              Registration and cancellation close one hour before the session
              starts. You can access the session in “My sessions” from that
              moment.
            </p>

            {!isRegistrationOpen && !isCancelled && (
              <Link className="session-details__back" to="/my-sessions">
                Go to my sessions
              </Link>
            )}
          </div>
        </aside>
      </article>
    </main>
  )
}

export default SessionDetailsPage
