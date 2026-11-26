import { Link, useNavigate } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import './CreateSessionPage.css'
import ManagerHeader from '../components/ManagerHeader'
import { buildSessionPayload } from '../utils/sessionPayload'

export default function CreateSessionPage({
  accessToken,
  onLogout,
  onCreateSession,
}) {
  const navigate = useNavigate()

  async function handleCreate(values) {
    const payload = buildSessionPayload(values, { isEditing: false })

    await onCreateSession(payload)
    navigate('/manager')
  }

  return (
    <>
      <ManagerHeader onLogout={onLogout} />

      <main className="create-session">
        <header className="create-session__heading">
          <Link to="/manager">← Session management</Link>
          <h1>Create session</h1>
          <p>
            Pick an existing training type or create a new one, then schedule
            the session.
          </p>
        </header>

        <SessionForm
          mode="create"
          accessToken={accessToken}
          initialValues={{
            trainingMode: 'existing',
          }}
          submitLabel="Create session"
          onSubmit={handleCreate}
        />
      </main>
    </>
  )
}
