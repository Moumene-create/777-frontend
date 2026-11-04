import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import SessionForm from '../components/SessionForm'
import './CreateSessionPage.css'

export default function CreateSessionPage({
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  return (
    <main className="create-session">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <header className="create-session__heading">
        <Link to="/manager/sessions">← Session management</Link>
        <h1>Create session</h1>
        <p>Schedule a training session for eligible participants.</p>
      </header>

      <p className="create-session__notice">
        Development preview — this form does not save sessions yet.
      </p>

      <SessionForm />
    </main>
  )
}