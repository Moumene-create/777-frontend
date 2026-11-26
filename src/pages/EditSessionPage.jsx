import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import ManagerHeader from '../components/ManagerHeader'
import { getManagementSession } from '../api/sessions'
import { getAgeCategoryLabelsFromIds } from '../utils/ageCategory'
import { buildSessionPayload } from '../utils/sessionPayload'
import './CreateSessionPage.css'

export default function EditSessionPage({
  accessToken,
  onLogout,
  onUpdateSession,
}) {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      setIsLoading(true)
      setError('')
      setSession(null)

      try {
        const data = await getManagementSession(sessionId, accessToken)

        if (isActive) {
          setSession(data)
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      isActive = false
    }
  }, [sessionId, accessToken])

  async function handleUpdate(values) {
    const payload = buildSessionPayload(values, { isEditing: true })

    await onUpdateSession(sessionId, payload)
    navigate('/manager')
  }

  const initialValues = session
    ? {
        trainingId: session.trainingId ?? '',
        title: session.title ?? '',
        description: session.description ?? '',
        date: session.date ?? '',
        time: String(session.startTime ?? '').slice(0, 5),
        durationMinutes: String(session.durationMinutes || 60),
        maxCapacity: String(session.maxCapacity || 100),
        zoomUrl: session.zoomUrl ?? '',
        prerequisites: session.prerequisites ?? '',
        targetAgeCategories: getAgeCategoryLabelsFromIds(
          session.targetAgeCategoryIds
        ),
        instructorId: session.instructorId ?? '',
      }
    : null

  return (
    <>
      <ManagerHeader onLogout={onLogout} />

      <main className="create-session">
        <header className="create-session__heading">
          <Link to="/manager">← Session management</Link>
          <h1>Edit session</h1>
          {session && <p>{session.title}</p>}
        </header>

        {isLoading ? (
          <p>Loading session…</p>
        ) : error ? (
          <div>
            <p role="alert">{error}</p>
            <Link to="/manager">Back to session management</Link>
          </div>
        ) : initialValues ? (
          <SessionForm
            key={session.id}
            mode="edit"
            initialValues={initialValues}
            accessToken={accessToken}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
          />
        ) : null}
      </main>
    </>
  )
}
