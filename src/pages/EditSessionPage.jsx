import { Link, useParams } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import SessionForm from '../components/SessionForm'
import './CreateSessionPage.css'

export default function EditSessionPage({
  sessions = [],
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const { sessionId } = useParams()

  const session = sessions.find(
    (item) => String(item.id) === sessionId
  )

  if (!session) {
    return (
      <main className="create-session">
        <PublicHeader
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        <header className="create-session__heading">
          <h1>Session not found</h1>
          <Link to="/manager/sessions">
            Back to session management
          </Link>
        </header>
      </main>
    )
  }

  const [date = '', timeWithOffset = ''] =
    (session.startDateTime || '').split('T')

  const initialValues = {
    trainingId: session.trainingId || '',
    title: session.title || '',
    description: session.Description || session.description || '',
    date,
    time: timeWithOffset.slice(0, 5),
    durationMinutes: String(session.durationMinutes ?? 60),
    maxCapacity: String(session.maxCapacity ?? 100),
    instructor: session.instructor || '',
    zoomUrl: session.zoomUrl || '',
    targetAgeCategories: session.targetAgeCategories || [],
  }

  return (
    <main className="create-session">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <header className="create-session__heading">
        <Link to="/manager/sessions">
          ← Session management
        </Link>

        <h1>Edit session</h1>
        <p>{session.title}</p>
      </header>

      <SessionForm
        key={session.id}
        initialValues={initialValues}
        submitLabel="Save changes"
      />
    </main>
  )
}