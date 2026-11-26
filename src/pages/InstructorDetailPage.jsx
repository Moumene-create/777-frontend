import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ManagerHeader from '../components/ManagerHeader'
import InstructorForm from '../components/InstructorForm'
import InstructorPhotoUploader from '../components/InstructorPhotoUploader'
import InstructorDeleteDialog from '../components/InstructorDeleteDialog'
import {
  deleteInstructor,
  getInstructor,
  updateInstructor,
} from '../api/instructors'
import './InstructorManagement.css'

export default function InstructorDetailPage({ accessToken, onLogout }) {
  const { instructorId } = useParams()
  const navigate = useNavigate()

  const [instructor, setInstructor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    async function load() {
      setIsLoading(true)
      setLoadError(null)
      setInstructor(null)

      try {
        const data = await getInstructor(instructorId, accessToken)

        if (isActive) {
          setInstructor(data)
        }
      } catch (error) {
        if (isActive) {
          setLoadError({ message: error.message, status: error.status ?? 0 })
          setInstructor(null)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [instructorId, accessToken, reloadKey])

  async function handleUpdate(payload) {
    const updated = await updateInstructor(
      instructorId,
      payload,
      accessToken
    )
    setInstructor(updated)
    return updated
  }

  async function handleDelete(id) {
    await deleteInstructor(id, accessToken)
    navigate('/manager/instructors', { replace: true })
  }

  return (
    <>
      <ManagerHeader onLogout={onLogout} />

      <main className="instructor-management">
        <header className="instructor-management__heading">
          <div className="instructor-management__heading-text">
            <Link
              className="instructor-management__back"
              to="/manager/instructors"
            >
              ← Instructor directory
            </Link>
            <p className="instructor-management__eyebrow">Instructor</p>
            <h1>{instructor?.fullName || 'Instructor details'}</h1>
            {instructor && (
              <p className="instructor-management__subtitle">
                {instructor.isFeatured
                  ? 'Featured on the public homepage when a photo is available.'
                  : 'Not featured on the public homepage.'}
              </p>
            )}
          </div>
        </header>

        {isLoading ? (
          <p>Loading instructor…</p>
        ) : loadError ? (
          <div className="instructor-management__error" role="alert">
            <p>{loadError.message}</p>

            {loadError.status === 401 && (
              <p>
                <Link to="/login">Log in again</Link>
              </p>
            )}

            <button
              className="instructor-management__retry"
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Retry
            </button>{' '}

            <Link
              className="instructor-management__secondary-link"
              to="/manager/instructors"
            >
              Back to instructors
            </Link>
          </div>
        ) : instructor ? (
          <div className="instructor-detail__layout">
            <aside className="instructor-detail__media">
              <InstructorPhotoUploader
                key={`photo-${instructor.id}`}
                accessToken={accessToken}
                instructor={instructor}
                onUploaded={setInstructor}
              />
            </aside>

            <section className="instructor-detail__form-card">
              <InstructorForm
                key={instructor.id}
                mode="edit"
                initialValues={instructor}
                accessToken={accessToken}
                onSubmit={handleUpdate}
                cancelTo="/manager/instructors"
              />

              <div className="instructor-detail__danger">
                <h2>Delete instructor</h2>
                <p>
                  Deleting removes this instructor permanently. Instructors
                  assigned to sessions cannot be deleted.
                </p>
                <button
                  className="instructor-detail__delete"
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  Delete instructor
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {isDeleteOpen && instructor && (
          <InstructorDeleteDialog
            instructor={instructor}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </main>
    </>
  )
}
