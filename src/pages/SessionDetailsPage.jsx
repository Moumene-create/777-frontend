import { Link, useParams } from 'react-router-dom'
import { mockSessions } from '../data/mockSessions'
import './SessionDetailsPage.css'
import PublicHeader from '../components/PublicHeader'

function SessionDetailsPage() {
  const { sessionId } = useParams()

  const session = mockSessions.find(
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

            <p>{session.description}</p>
          </section>

          <section className="session-details__section">
            <h2>Prerequisites</h2>

            <p>All are welcome. No prior knowledge is required.</p>
          </section>

          <p
            className={`session-details__availability ${
              isFull ? 'session-details__availability--full' : ''
            }`}
          >
            {isFull
              ? 'Registration is full.'
              : `${spotsRemaining} places remaining.`}
          </p>

          <button
            type="button"
            className={`training-card__button_view ${
              isFull
                ? 'training-card__button--full'
                : 'training-card__button--register'
            }`}
            disabled={isFull}
          >
            {isFull ? 'Registration full' : 'Register'}
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
          </div>

          <div className="session-details__capacity">
            <span>Places filled</span>

            <strong>
              {session.registeredCount} / {session.maxCapacity}
            </strong>
          </div>
        </aside>

        
      </article>
    </main>
  )
}

export default SessionDetailsPage