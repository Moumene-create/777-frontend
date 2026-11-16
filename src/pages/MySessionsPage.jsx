import { Navigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import TrainingCard from '../components/TrainingCard'
import './MySessionsPage.css'
import { joinSession } from '../api/sessions'
import { useState } from 'react'

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
  const [joiningSessionId, setJoiningSessionId] = useState(null)
  const [joinError, setJoinError] = useState(null)

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

  async function handleJoinSession(sessionId) {
    setJoiningSessionId(sessionId)
    setJoinError(null)

    try {
      const zoomUrl = await joinSession(sessionId)
      window.open(zoomUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setJoinError(error.message)
    } finally {
      setJoiningSessionId(null)
    }
  }

  return (
    <main className="page_width">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <h1 className="my-sessions__title">My sessions</h1>
      {joinError && (
        <p className="join-error">{joinError}</p>
      )}
      {mySessions.length === 0 ? (
        <p>You are not registered for any sessions yet.</p>
      ) : (
        <section className="sessions-grid">
          {mySessions.map((session) => (
            <TrainingCard
              key={session.id}
              session={session}
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
              onJoin={() => handleJoinSession(session.id)}
              isJoining={joiningSessionId === session.id}
            />
          ))}
        </section>
      )}
    </main>
  )
}

export default MySessionsPage