import { Link, useParams } from 'react-router-dom'
import { getSessionStatus } from '../utils/sessionStatus'
import './AttendanceValidationPage.css'
import ManagerHeader from '../components/ManagerHeader'
import { mockAttendance } from '../data/mockAttendance'
import { useState } from 'react'

export default function AttendanceValidationPage({
  sessions = [],
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  const { sessionId } = useParams()
  const [attendance, setAttendance] = useState(mockAttendance)
  const session = sessions.find((item) => String(item.id) === sessionId)
  const attendanceRecords = attendance.filter((record) => String(record.sessionId) === sessionId)
  const attendedCount = attendanceRecords.length
  const validatedCount = attendanceRecords.filter((record) => Boolean(record.validatedAt)).length
  const pendingCount = attendedCount - validatedCount
  const isCompleted = session && getSessionStatus(session, new Date()) === 'COMPLETED'

  function handleValidateAttendance(recordId) {
    const isManager = isAuthenticated && currentUser?.roles?.includes('SESSION_MANAGER') === true
    if (!isManager || !isCompleted) return
    const validatedAt = new Date().toISOString()
    setAttendance((currentRecords) =>
      currentRecords.map((record) => {
        const belongsToSession = String(record.sessionId) === sessionId
        if (  record.id !== recordId || !belongsToSession || record.validatedAt) { return record }
        return {...record, validatedAt, } }))}
  return (
    <>
      <ManagerHeader onLogout={onLogout} />
        <main className="attendance-validation">
          <header className="create-session__heading">
            <Link to="/manager">
              ← Session management
            </Link>
            <h1>Attendance validation</h1>
            <p> {session ? session.title : 'Session not found'} </p>
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
              <dl className="attendance-summary">
                <div className="attendance-summary__item">
                  <dt>Recorded attendees</dt>
                  <dd>{attendedCount}</dd>
                </div>

                <div className="attendance-summary__item">
                  <dt>Pending validation</dt>
                  <dd>{pendingCount}</dd>
                </div>

                <div className="attendance-summary__item">
                  <dt>Validated attendance</dt>
                  <dd>{validatedCount}</dd>
                </div>
              </dl>
            </section>)}

          {attendanceRecords.length === 0 ? (<p>No attendance has been recorded for this session.</p>) : (
            <ul className="attendance-list">
              {attendanceRecords.map((record) => (
                <li className="attendance-list__item" key={record.id}>
                  <div className="attendance-list__details">
                    <span className="attendance-list__name">
                      {record.participantName}
                    </span>
                    <span className={`attendance-list__status ${ record.validatedAt ? 'attendance-list__status--validated' : 'attendance-list__status--pending'}`}>
                      {record.validatedAt ? 'Validated' : 'Pending validation'}
                    </span>
                  </div>
                  <button
                    className="attendance-list__validate"
                    type="button"
                    disabled={Boolean(record.validatedAt)}
                    onClick={() => handleValidateAttendance(record.id)}
                    aria-label={`Validate attendance for ${record.participantName}`}>
                    {record.validatedAt ? 'Validated' : 'Validate attendance'}
                  </button>
                </li> ))}
            </ul>)}
        </main>
    </>)}