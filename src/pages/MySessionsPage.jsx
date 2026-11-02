import { Navigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import TrainingCard from '../components/TrainingCard'
import './MySessionsPage.css'

function MySessionsPage({
  sessions,
  registeredSessionIds,
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const now = new Date()

  const isSessionCompleted = (session) => {
    const sessionEndTime = new Date(session.startDateTime)
    sessionEndTime.setMinutes(
      sessionEndTime.getMinutes() + session.durationMinutes
    )

    return sessionEndTime < now
  }

  const mySessions = sessions.filter((session) =>
    registeredSessionIds.includes(session.id)
  )

  return (
    <main className="page_width">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <h1 className="my-sessions__title">My sessions</h1>

      {mySessions.length === 0 ? (
        <p>You are not registered for any sessions yet.</p>
      ) : (
        <section className="sessions-grid">
          {mySessions.map((session) => (
            <TrainingCard
              key={session.id}
              id={session.id}
              title={session.title}
              description={session.description}
              date={session.date}
              time={session.time}
              duration={session.duration}
              instructor={session.instructor}
              instructorImage={session.instructorImage}
              registeredCount={session.registeredCount}
              maxCapacity={session.maxCapacity}
              isRegistered={registeredSessionIds.includes(session.id)}
              targetAgeCategories={session.targetAgeCategories}
              isCompleted={isSessionCompleted(session)}
            />
          ))}
        </section>
      )}
    </main>
  )
}

export default MySessionsPage