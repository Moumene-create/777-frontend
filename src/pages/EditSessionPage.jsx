import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import ManagerHeader from '../components/ManagerHeader'
import {getManagementSession,updateSession} from '../api/sessions'
import { getAgeCategoryLabel } from '../utils/ageCategory'
import './CreateSessionPage.css'

export default function EditSessionPage({
  isAuthenticated,
  currentUser,
  onLogout,
  accessToken,
}) {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const AGE_CATEGORY_LABEL_TO_ID = {
  '7-10': 1,
  '11-14': 2,
  '15-17': 3,
  '18-23': 4,
  '24-30': 5,
  '31-45': 6,
  '46-60': 7,}
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
      } catch (error) {
        if (isActive) {
          setError(error.message)
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

  const initialValues = session
    ? {
        trainingId: session.trainingId || '',
        title: session.title || '',
        description: session.description || '',
        date: session.date || '',
        time: session.startTime?.slice(0, 5) || '',
        durationMinutes: String(session.durationMinutes ?? 60),
        maxCapacity: String(session.maxCapacity ?? 100),
        instructor: session.instructorName || '',
        zoomUrl: session.zoomUrl || '',
        targetAgeCategories: (session.targetAgeCategoryIds || [])
          .map(getAgeCategoryLabel)
          .filter(Boolean),
      }
    : null

  async function handleUpdateSession(form) {
  const categoryIds = form.targetAgeCategories.map(
    (label) => AGE_CATEGORY_LABEL_TO_ID[label]
  )

  if (categoryIds.some((id) => id === undefined)) {
    throw new Error('An age category could not be recognized.')
  }

  await updateSession(
    sessionId,
    {
      title: form.title.trim(),
      description: session.description,
      date: form.date,
      start_time: form.time,
      duration_minutes: Number(form.durationMinutes),
      max_capacity: Number(form.maxCapacity),
      zoom_url: form.zoomUrl.trim(),
      instructor_name: form.instructor.trim(),
      target_age_category_ids: categoryIds,
    },
    accessToken
  )
}

  return (
    <>
      <ManagerHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main>
        <h1>Edit session</h1>
        <Link to="/manager">Back to sessions</Link>

        {isLoading ? (
          <p>Loading session...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : session ? (
          <SessionForm
            key={session.id}
            initialValues={initialValues}
            submitLabel="Save changes"
            accessToken={accessToken}
            isEditing
            onSubmit={handleUpdateSession}
          />
        ) : null}
      </main>
    </>
  )
}