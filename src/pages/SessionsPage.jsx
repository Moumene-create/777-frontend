import TrainingCard from '../components/TrainingCard'

const sessions = [
        {
          id: 1,
          title: 'Introduction to Artificial Intelligence',
          description:
            'Discover the foundations of artificial intelligence and how it is used in everyday life.',
          date: '15 October 2026',
          time: '10:00',
          duration: '90 minutes',
          instructor: '7.77 Training Team',
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
          registeredCount: 100,
          maxCapacity: 100,
        },
      ] 



function SessionsPage() {
  return (
    <main>
      <h1>Upcoming training sessions</h1>

      <p>Discover sessions available for you.</p>
      <section className="sessions-grid" aria-label="Available training sessions">
        {sessions.map((session) => (
          <TrainingCard
            key={session.id}
            title={session.title}
            description={session.description}
            date={session.date}
            time={session.time}
            duration={session.duration}
            instructor={session.instructor}
            registeredCount={session.registeredCount}
            maxCapacity={session.maxCapacity}
          />
        ))}
      </section>
    </main>
  )
}

export default SessionsPage