import { Link, useParams } from 'react-router-dom'
import './SessionDetailsPage.css'
import PublicHeader from '../components/PublicHeader'

function SessionDetailsPage({
  sessions,
  registeredSessionIds,
  onRegister,
  onUnregister,
}) {
  const { sessionId } = useParams()

  const session = sessions.find(
  (mockSession) => mockSession.id === Number(sessionId)
)
  
  if (!session) {
    return (
      <main className="session-details-page">
        <h1>Session not found</h1>

        <Link to="/sessions">Back to sessions</Link>
      </main>
    )
  }
  const isRegistered = registeredSessionIds.includes(session.id)
  const isFull = session.registeredCount >= session.maxCapacity
  const spotsRemaining = Math.max(
    0,
    session.maxCapacity - session.registeredCount
  )

  return (

    
    <main className="session-details-page">
      <PublicHeader />
      

      <article className="session-details">
        <section className="session-details__main">
          <h1 className="session-details__title">{session.title}</h1>
          <p className="session-details__instructor">
            {session.instructor}
          </p> 
          <section className="session-details__section">
            <h2>Description</h2>

            <p>{session.Description}</p>
          </section>

          <section className="session-details__section">
            <h2>Prerequisites</h2>

            <p>{session.Prerequisites}</p>
          </section>

          {/* <p
            className={`session-details__availability ${
              isFull ? 'session-details__availability--full' : ''
            }`}
          >
            {isFull
              ? 'No more places'
              : `${spotsRemaining} ${spotsRemaining === 1 ? 'place' : 'places'}  remaining.`}
          </p> */}

          <button
            type="button"
            className={`training-card__button ${
              isRegistered
                ? 'training-card__button--registered'
                : isFull
                  ? 'training-card__button--full'
                  : 'training-card__button--register'
            }`}
            onClick={() => {
              if (isRegistered) {
                onUnregister(session.id)
              } else {
                onRegister(session.id)
              }
            }}
            disabled={isFull && !isRegistered}
            aria-disabled={isFull && !isRegistered}
          >
            {isFull && !isRegistered ? (
              'Registration full'
            ) : isRegistered ? (
              <>
                <span className="training-card__btn-text-enrolled">Enrolled</span>
                <span className="training-card__btn-text-cancel">Cancel registration</span>
              </>
            ) : (
              'Register'
            )}
          </button>
        </section>
        <aside className="session-details__sidebar">
          <img
            className="session-details__image"
            src={session.instructorImage}
            alt={`Instructor ${session.instructor}`}
          />

          <div className="session-details__schedule">
            <div className="session-details__schedule-item">
              <span>Date : <strong>{session.date}</strong> </span>
              
            </div>

            <div className="session-details__schedule-item">
              <span>Duration : <strong>{session.duration}</strong></span>
              
            </div>

            <div className="session-details__schedule-item">
              <span>Time : <strong>{session.time}</strong></span>
              
            </div>

            <div className="session-details__schedule-item">
              <span>Format : <strong>Online</strong></span>
              
            </div>
          

          <div className="session-details__schedule-item">
            <span>Places filled : <strong>
              {session.registeredCount} / {session.maxCapacity}
            </strong></span>

            
          </div>
          </div>
        </aside>

        
      </article>
    </main>
  )
}

export default SessionDetailsPage