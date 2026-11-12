import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './SessionDetailsPage.css'
import PublicHeader from '../components/PublicHeader'
import {
  getSessionStatus,
  isBeforeRegistrationCutoff,
} from '../utils/sessionStatus'
import { getSessionById } from '../api/sessions'

function SessionDetailsPage({
  registeredSessionIds,
  onRegister,
  onUnregister,
  isAuthenticated,
  currentUser,
  onLogout,
  accessToken,
}) {
  const [session, setSession] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [sessionError, setSessionError] = useState(null)
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

    useEffect(() => {
  let isActive = true

  async function loadSession() {
    setIsLoadingSession(true)
    setSessionError(null)

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

  if (sessionError) {
    return (
      <main className="session-details-page">
        <PublicHeader
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <h1>Session unavailable</h1>
        <p>{sessionError}</p>
        <Link to="/sessions">Back to sessions</Link>
      </main>
    )
  }

if (!session) {
  return null
}
  
  const isRegistered = registeredSessionIds.includes(session.id)
  const isFull = session.registeredCount >= session.maxCapacity
  const sessionStatus = getSessionStatus(session, now)
  
  const isRegistrationClosed =
    !isBeforeRegistrationCutoff(session, now)
    
  const isEligible = isAuthenticated
    ? !session.targetAgeCategories ||
      session.targetAgeCategories.includes(currentUser?.ageCategory)
    : true

  const eligibilityMessage = isEligible
    ? null
    : 'This session is not available for your age category.'

  const isActionDisabled =
    isRegistrationClosed ||
    (isFull && !isRegistered) ||
    !isEligible

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
// console.log('Session details debug:', {
//   isAuthenticated,
//   isRegistered,
//   isFull,
//   isRegistrationClosed,
//   isEligible,
//   isActionDisabled,
//   hasOnRegister: typeof onRegister === 'function',
//   registeredSessionIds,
// })

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
            {session.instructorName}
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
            <p>{session.prerequisites ?? 'No prerequisites specified.'}</p>
          </section>
          <p className="session-details__cutoff-message">
              Note: Registration and cancellation close one hour before the
              session starts.
            </p>
        </section>
        

        <aside className="session-details__sidebar">
          {session.instructorImage && (
            <img
              className="session-details__image"
              src={session.instructorImage}
              alt={`Instructor ${session.instructorName}`}
            />
          )}

          <div className="session-details__schedule">
            <div className="session-details__schedule-item">
              <span>
                Date: <strong>{session.date}</strong>
              </span>
            </div>

            <div className="session-details__schedule-item">
              <span>
                Duration: <strong>{session.durationMinutes}</strong>
              </span>
            </div>

            <div className="session-details__schedule-item">
              <span>
                Time: <strong>{session.startTime}</strong>
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
          {eligibilityMessage && (
            <p className="session-details__eligibility-message">
              {eligibilityMessage}
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