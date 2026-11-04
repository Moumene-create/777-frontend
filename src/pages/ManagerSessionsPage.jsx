import PublicHeader from '../components/PublicHeader'
import { getSessionStatus } from '../utils/sessionStatus'
import './ManagerSessionsPage.css'
import { Link } from 'react-router-dom'

export default function ManagerSessionsPage({
  sessions = [],
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const now = new Date()

  return (
    <main className="manager-sessions">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <header className="manager-sessions__heading">
        <p className="manager-sessions__eyebrow">Session manager</p>
        <h1>Session management</h1>
        <p>Review training sessions and registration counts.</p>
        <Link to="/manager/sessions/new">
        Create session
        </Link>
      </header>

      <p className="manager-sessions__notice">
        Development preview : mock data, no management actions enabled.
      </p>

      {sessions.length === 0 ? (
        <p className="manager-sessions__empty">
          No sessions have been created yet.
        </p>
      ) : (
        <div
          className="manager-sessions__table-wrapper"
          role="region"
          aria-label="Training sessions"
          tabIndex={0}
        >
          <table className="manager-sessions__table">
            <caption>Training session overview</caption>

            <thead>
              <tr>
                <th scope="col">Session</th>
                <th scope="col">Schedule</th>
                <th scope="col">Status</th>
                <th scope="col">Registrations</th>
                <th scope="col">Age categories</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((session) => {
                const status = getSessionStatus(session, now)

                return (
                  <tr key={session.id}>
                    <th scope="row">
                      <span className="manager-sessions__session-title">
                        {session.title}
                      </span>
                      <span className="manager-sessions__instructor">
                        {session.instructor}
                      </span>
                    </th>

                    <td>
                      <time dateTime={session.startDateTime}>
                        {new Date(session.startDateTime).toLocaleString(
                          undefined,
                          {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }
                        )}
                      </time>
                    </td>

                    <td>
                      <span className="manager-sessions__status">
                        {status}
                      </span>
                    </td>

                    <td>
                      {session.registeredCount} / {session.maxCapacity}
                    </td>

                    <td>{session.targetAgeCategories.join(', ')}</td>
                    <td>
                    <Link to={`/manager/sessions/${session.id}/edit`}>
                      Edit
                    </Link>
                  </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}