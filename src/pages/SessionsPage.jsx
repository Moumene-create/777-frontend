import { useEffect, useState } from 'react';
import TrainingCard from '../components/TrainingCard'
import FolderIllustration from '../components/FolderIllustration'
import PublicHeader from '../components/PublicHeader'
import './SessionsPage.css'
import { mockSessions } from '../data/mockSessions'
function SessionsPage() {
  const [registeredSessionIds, setRegisteredSessionIds] = useState([])
  const [sessions, setSessions] = useState (mockSessions);
  function handleRegister(sessionId){
    setRegisteredSessionIds((currentIds) => [...currentIds, sessionId]);

    setSessions(
      sessions.map((session) => 
        session.id === sessionId
        ? { ...session, registeredCount: session.registeredCount + 1 }
        : session
      )
    )
  }
  function handleUnregister(sessionId) {
    setRegisteredSessionIds((currentIds) =>
      currentIds.filter((id) => id !== sessionId)
    );

    setSessions(
      sessions.map((session) =>
        session.id === sessionId
          ? { ...session, registeredCount: session.registeredCount - 1 }
          : session
      )
    );
  }

  return (
    <main className='page_width'>
      
      <PublicHeader />

      <h1 className='sessions-page__title'>Upcoming training sessions</h1>
   
      {/* <p className='session-page__sub_title'>Discover sessions available for you.</p> */}
      <section className="sessions-grid" aria-label="Available training sessions">
        {sessions.length ===0 ? (
          <p>No training sessions are available right now. Please check again later.</p>
        ):(
        
          sessions.map((session) => (
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
            // isRegistered={registeredSessionIds.includes(session.id)}
            // onRegister={ () => handleRegister(session.id)}
            // onUnregister={() => handleUnregister(session.id)}
          />
        )))}
      </section>
    </main>
    
  )
}

export default SessionsPage