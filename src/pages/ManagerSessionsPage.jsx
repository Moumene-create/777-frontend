import PublicHeader from '../components/PublicHeader'
import { getSessionStatus } from '../utils/sessionStatus'
import './ManagerSessionsPage.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import CancelSessionDialog from '../components/CancelSessionDialog'

export default function ManagerSessionsPage({
  sessions = [],
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const [sessionToCancel, setSessionToCancel] = useState(null)
  const now = new Date()
  const [sessionSearch, setSessionSearch] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const searchTerm = sessionSearch.trim().toLowerCase()

  const filteredSessions = sessions.filter((session) => {
    const searchableText =
      `${session.title ?? ''} ${session.instructor ?? ''}`.toLowerCase()

    const matchesSearch = searchableText.includes(searchTerm)

    const matchesDate =
      !scheduleDate ||
      new Date(session.startDateTime).toDateString() ===
        new Date(`${scheduleDate}T00:00:00`).toDateString()

    return matchesSearch && matchesDate
  })
  
  return (
    <main className="manager-sessions">

    <header className="manager-sessions__heading">
      <div className="manager-sessions__heading-text">
        <h1>Session management</h1>
      </div>

      <div className="manager-sessions__header-actions">
        <Link
          className="manager-sessions__action manager-sessions__create"
          to="/manager/new"
        >
          Create session
        </Link>

        <button
          className="manager-sessions__clear"
          type="button"
          onClick={() => {
            setSessionSearch('')
            setScheduleDate('')
          }}
          disabled={!sessionSearch && !scheduleDate}
        >
          Clear filters
        </button>
      </div>
    </header>

{sessions.length === 0 ? (
  <p className="manager-sessions__empty">
    No sessions have been created yet.
  </p>
) : (
  <>
    <div className="manager-sessions__filter-toolbar">
      <p role="status">
        {filteredSessions.length} of {sessions.length} sessions
      </p>
    </div>

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
                <th scope="col">
                  <label className="manager-sessions__filter">
                    <span>Session</span>

                    <span className="manager-sessions__search-field">
                      <svg
                        className="manager-sessions__search-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                      </svg>

                      <input
                        type="search"
                        aria-label="Search sessions by title or instructor"
                        placeholder="Search sessions..."
                        value={sessionSearch}
                        onChange={(event) => setSessionSearch(event.target.value)}
                      />
                    </span>
                  </label>
                </th>
                <th scope="col">
                  <label className="manager-sessions__filter">
                    <span>Schedule</span>

                    <span className="manager-sessions__search-field manager-sessions__date-field">
                      <input
                        type="date"
                        aria-label="Filter sessions by scheduled date"
                        value={scheduleDate}
                        onChange={(event) => setScheduleDate(event.target.value)}
                      />
                    </span>
                  </label>
                </th>
                <th scope="col">Status</th>
                <th scope="col">Registrations</th>
                <th scope="col">Age categories</th>
                <th scope="col">Actions</th>

              </tr>
            </thead>

            <tbody>
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    No sessions match your search.
                  </td>
                </tr>
              )}
              {filteredSessions.map((session) => {
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
                      <Link
                        className="manager-sessions__action"
                        to={`/manager/${session.id}/attendance`}
                      >
                        Attendance
                      </Link>
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
                    <div className="manager-sessions__actions">
                      <Link
                        className="manager-sessions__action"
                        to={`/manager/${session.id}/edit`}
                      >
                        Edit
                      </Link>

                      <button
                        className="manager-sessions__action"
                        type="button"
                        onClick={() => setSessionToCancel(session)}
                        disabled={status === 'CANCELLED'}
                      >
                        Cancel
                      </button>
                      
                    </div>
                  </td>
                  
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
      {sessionToCancel && (
        <CancelSessionDialog
          session={sessionToCancel}
          onClose={() => setSessionToCancel(null)}
        />
      )}
    </main>
  )
}