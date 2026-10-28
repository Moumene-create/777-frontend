import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './SessionDetailsPage.css'
import PublicHeader from '../components/PublicHeader'
import {
  getSessionStatus,
  isBeforeRegistrationCutoff,
} from '../utils/sessionStatus'

function SessionDetailsPage({
  sessions,
  registeredSessionIds,
  onRegister,
  onUnregister,
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const session = sessions.find(
    (mockSession) => mockSession.id === Number(sessionId)
  )

  if (!session) {
    return (
      <main className="session-details-page">
        <PublicHeader
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        <h1>Session not found</h1>
        <Link to="/sessions">Back to sessions</Link>
      </main>
    )
  }

  const isRegistered = registeredSessionIds.includes(session.id)
  const isFull = session.registeredCount >= session.maxCapacity
  const sessionStatus = getSessionStatus(session, now)

  const isRegistrationClosed =
    !isBeforeRegistrationCutoff(session, now)

  const isActionDisabled =
    isRegistrationClosed || (isFull && !isRegistered)

  function handleRegistrationClick() {
    if (isActionDisabled) return

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (isRegistered) {
      onUnregister(session.id)
    } else {
      onRegister(session.id)
    }
  }
  const [now, setNow] = useState(() => new Date())

useEffect(() => {
  const intervalId = setInterval(() => {
    setNow(new Date())
  }, 1000)

  return () => clearInterval(intervalId)
}, [])

  return (
    <main className="session-details-page">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <article className="session-details">
        <section className="session-details__main">
          <h1 className="session-details__title">{session.title}</h1>

          <p className="session-details__instructor">
            {session.instructor}
          </p>

          <p className="session-details__status">
            Status: {sessionStatus}
          </p>

          <section className="session-details__section">
            <h2>Description</h2>
            <p>{session.Description}</p>
          </section>

          <section className="session-details__section">
            <h2>Prerequisites</h2>
            <p>{session.Prerequisites}</p>
          </section>
          <p className="session-details__cutoff-message">
              Note : Registration and cancellation close one hour before the
              session starts.
            </p>
        </section>
        

        <aside className="session-details__sidebar">
          <img
            className="session-details__image"
            src={session.instructorImage}
            alt={`Instructor ${session.instructor}`}
          />

          <div className="session-details__schedule">
            <div className="session-details__schedule-item">
              <span>
                Date: <strong>{session.date}</strong>
              </span>
            </div>

            <div className="session-details__schedule-item">
              <span>
                Duration: <strong>{session.duration}</strong>
              </span>
            </div>

            <div className="session-details__schedule-item">
              <span>
                Time: <strong>{session.time}</strong>
              </span>
            </div>

            <div className="session-details__schedule-item">
              <span>
                Format: <strong>Online</strong>
              </span>
            </div>

            <div className="session-details__schedule-item">
              <span>
                Places filled:{' '}
                <strong>
                  {session.registeredCount} / {session.maxCapacity}
                </strong>
              </span>
            </div>
          </div>

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
            {isRegistrationClosed ? (
              isRegistered ? (
                'Cancellation closed'
              ) : (
                'Registration closed'
              )
            ) : isFull && !isRegistered ? (
              'Registration full'
            ) : isRegistered ? (
              <>
                <span className="training-card__btn-text-enrolled">
                  Enrolled
                </span>
                <span className="training-card__btn-text-cancel">
                  Cancel registration
                </span>
              </>
            ) : (
              'Register'
            )}
          </button>

        </aside>
      </article>
    </main>
  )
}

export default SessionDetailsPage