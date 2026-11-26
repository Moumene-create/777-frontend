import TrainingCard from '../components/TrainingCard'
import PublicHeader from '../components/PublicHeader'
import './SessionsPage.css'
import { useNow } from '../hooks/useNow'
import {
  getSessionStatus,
  sortSessionsForDisplay,
} from '../utils/sessionStatus'

function SessionsPage({
  sessions,
  registeredSessionIds,
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const now = useNow()

  // Completed sessions the participant is not registered for are excluded
  // from the discovery list; everything else is ordered by lifecycle status.
  const visibleSessions = sortSessionsForDisplay(
    sessions.filter(
      (session) =>
        !(
          getSessionStatus(session, now) === 'COMPLETED' &&
          !registeredSessionIds.includes(session.id)
        )
    ),
    now
  )

  return (
    <main className="page_width">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <h1 className="sessions-page__title">Upcoming training sessions</h1>

   

      <section
        className="sessions-grid"
        aria-label="Available training sessions"
      >
        {visibleSessions.length === 0 ? (
          <p>
            No training sessions are available for your age category right now.
            Please check again later.
          </p>
        ) : (
          visibleSessions.map((session) => (
            <TrainingCard
              key={session.id}
              session={session}
              isRegistered={registeredSessionIds.includes(session.id)}
            />
          ))
        )}
      </section>
    </main>
  )
}

export default SessionsPage
