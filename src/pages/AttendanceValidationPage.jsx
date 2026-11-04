import { Link, useParams } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import { getSessionStatus } from '../utils/sessionStatus'
import './CreateSessionPage.css'

export default function AttendanceValidationPage({
  sessions = [],
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const { sessionId } = useParams()

  const session = sessions.find(
    (item) => String(item.id) === sessionId
  )

  const isCompleted =
    session &&
    getSessionStatus(session, new Date()) === 'COMPLETED'

  return (
    <main className="create-session">


      <header className="create-session__heading">
        <Link to="/manager">
          ← Session management
        </Link>

        <h1>Attendance validation</h1>

        <p>
          {session ? session.title : 'Session not found'}
        </p>
      </header>

      {!session ? (
        <p>The requested session does not exist.</p>
      ) : !isCompleted ? (
        <p className="create-session__notice">
          Attendance can be validated after the session is completed.
        </p>
      ) : (
        <section aria-labelledby="attendance-records-heading">
          

          <h2 id="attendance-records-heading">
            Attendance records
          </h2>

        </section>
      )}
    </main>
  )
}