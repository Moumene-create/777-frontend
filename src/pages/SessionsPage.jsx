import { useEffect, useState } from 'react';
import TrainingCard from '../components/TrainingCard'
import FolderIllustration from '../components/FolderIllustration'

function SessionsPage() {
  const [registeredSessionIds, setRegisteredSessionIds] = useState([])
  const [sessions, setSessions] = useState ([
        {
          id: 1,
          title: 'Introduction to Artificial Intelligence',
          description:
            'Discover the foundations of artificial intelligence and how it is used in everyday life.',
          date: '15 October 2026',
          time: '10:00',
          duration: '90 minutes',
          instructor: '7.77 Training Team',
          instructorImage: 'https://media.licdn.com/dms/image/v2/D4D22AQEUS7WVH6sNpg/feedshare-image-high-res/B4DaAPXGOZJUAU-/0/1786964108854?e=1792627200&v=beta&t=zb2r6YCNHX6BtCHSeanto4a36QDL_foBSEEGL6LZRrE',
          registeredCount: 23,
          maxCapacity: 100,
        },
        {
          id: 2,
          title: 'Cybersecurity Basics',
          description:
            'Learn practical habits for protecting your personal data and online accounts.',
          date: '22 October 2026',
          time: '14:00',
          duration: '60 minutes',
          instructor: '7.77 Security Team',
          instructorImage: 'https://media.licdn.com/dms/image/v2/D4D22AQExQFoVipHtHA/feedshare-image-high-res/B4DaAPXD9SHQAY-/0/1786964099676?e=1792627200&v=beta&t=kVzFrOFAFbe-VDYDxqXOg1sSt0VHApr8eH4kScNDmYs',
          registeredCount: 99,
          maxCapacity: 100,
        },
        {
          id: 3,
          title: 'Cybersecurity Basics',
          description:
            'Learn practical habits for protecting your personal data and online accounts.',
          date: '22 October 2026',
          time: '14:00',
          duration: '60 minutes',
          instructor: '7.77 Security Team',
          instructorImage: 'https://media.licdn.com/dms/image/v2/D4D22AQGqmqyHQLVNrw/feedshare-image-high-res/B4DaAPXDoyHgAU-/0/1786964098432?e=1792627200&v=beta&t=MzgRIxjphTYrz8i7iLSTLTrycDsHkWHwgIolajBvxnc',
          registeredCount: 64,
          maxCapacity: 100,
        },
        {
          id: 4,
          title: 'Cybersecurity Basics',
          description:
            'Learn practical habits for protecting your personal data and online accounts.',
          date: '22 October 2026',
          time: '14:00',
          duration: '60 minutes',
          instructor: '7.77 Security Team',
          instructorImage: 'https://media.licdn.com/dms/image/v2/D4D22AQEiduJT5U0B_w/feedshare-image-high-res/B4DaAPXAoaJgAU-/0/1786964085977?e=1792627200&v=beta&t=G8cBxcP9ntSyPS7WSVVY2TEtW_manZE1caaElLirVXg',
          registeredCount: 100,
          maxCapacity: 100,
        },
      ] );
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
    <main>
      <h1>Upcoming training sessions</h1>
      
      <p>Discover sessions available for you.</p>
      <section className="sessions-grid" aria-label="Available training sessions">
        {sessions.length ===0 ? (
          <p>No training sessions are available right now. Please check again later.</p>
        ):(
        
          sessions.map((session) => (
          <TrainingCard
            key={session.id}
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
            onRegister={ () => handleRegister(session.id)}
            onUnregister={() => handleUnregister(session.id)}
          />
        )))}
      </section>
    </main>
    
  )
}

export default SessionsPage