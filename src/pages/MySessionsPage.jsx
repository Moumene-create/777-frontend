import PublicHeader from '../components/PublicHeader'
import TrainingCard from '../components/TrainingCard'
import './MySessionsPage.css'
import { useState } from 'react'
import { useNow } from '../hooks/useNow'
import { sortSessionsForDisplay } from '../utils/sessionStatus'

function MySessionsPage({
  mySessions,
  isAuthenticated,
  currentUser,
  onLogout,
  onJoin,
}) {
  const now = useNow(15_000)
  const [joiningSessionId, setJoiningSessionId] = useState(null)
  const [joinError, setJoinError] = useState('')
  const [blockedZoomUrl, setBlockedZoomUrl] = useState('')

  const sessions = sortSessionsForDisplay(mySessions, now)

  async function handleJoinSession(sessionId) {
    if (joiningSessionId) {
      return
    }

    setJoiningSessionId(sessionId)
    setJoinError('')
    setBlockedZoomUrl('')

    try {
      const zoomUrl = await onJoin(sessionId)
      const opened = window.open(zoomUrl, '_blank', 'noopener,noreferrer')

      if (!opened) {
        setBlockedZoomUrl(zoomUrl)
      }
    } catch (error) {
      setJoinError(error.message || 'Could not join the session.')
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
        <p className="join-error" role="alert">
          {joinError}
        </p>
      )}

      {blockedZoomUrl && (
        <p className="join-fallback" role="status">
          Your browser blocked the new tab.{' '}
          <a href={blockedZoomUrl} target="_blank" rel="noopener noreferrer">
            Open the session link
          </a>
          .
        </p>
      )}

      {sessions.length === 0 ? (
        <p>
          You are not registered for any sessions yet. Browse the available
          sessions to register.
        </p>
      ) : (
        <section className="sessions-grid" aria-label="My registered sessions">
          {sessions.map((session) => (
            <TrainingCard
              key={session.id}
              session={session}
              isRegistered
              showJoin
              onJoin={handleJoinSession}
              isJoining={joiningSessionId === session.id}
            />
          ))}
        </section>
      )}
    </main>
  )
}

export default MySessionsPage
