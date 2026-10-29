import TrainingCard from '../components/TrainingCard'
import FolderIllustration from '../components/FolderIllustration'
import PublicHeader from '../components/PublicHeader'
import './SessionsPage.css'
function SessionsPage({
  sessions,
  registeredSessionIds,
  onRegister,
  onUnregister,
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const now = new Date()

  const isSessionCompleted = (session) => {
    const sessionEndTime = new Date(session.startDateTime)
    sessionEndTime.setMinutes(
      sessionEndTime.getMinutes() + session.durationMinutes
    )

    return sessionEndTime < now
  }
  const visibleSessions = isAuthenticated
  ? sessions.filter((session) =>
      session.targetAgeCategories.includes(currentUser?.ageCategory)
    )
  : sessions
  return (
    <main className='page_width'>
      
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <h1 className='sessions-page__title'>Upcoming training sessions</h1>
   
      {/* <p className='session-page__sub_title'>Discover sessions available for you.</p> */}
      <section className="sessions-grid" aria-label="Available training sessions">
        {visibleSessions.length ===0 ? (
          <p>No training sessions are available right now. Please check again later.</p>
        ):(
        
          visibleSessions.map((session) => (
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
            onRegister={() => onRegister(session.id)}
            onUnregister={() => onUnregister(session.id)}
            isCompleted={isSessionCompleted(session)}
          />
        )))}
      </section>
    </main>
    
  )
}

export default SessionsPage