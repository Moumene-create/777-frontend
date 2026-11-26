import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ManagerHeader from '../components/ManagerHeader'
import InstructorDeleteDialog from '../components/InstructorDeleteDialog'
import {
  deleteInstructor,
  getInstructors,
  updateInstructor,
} from '../api/instructors'
import { buildInstructorPayload } from '../utils/instructor'
import './InstructorManagement.css'

function initialsOf(instructor) {
  return `${instructor.firstName?.[0] ?? ''}${
    instructor.lastName?.[0] ?? ''
  }`.toUpperCase()
}

export default function InstructorDirectoryPage({ accessToken, onLogout }) {
  const [instructors, setInstructors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [busyId, setBusyId] = useState('')
  const [instructorToDelete, setInstructorToDelete] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    async function load() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await getInstructors(accessToken)

        if (isActive) {
          setInstructors(data)
        }
      } catch (error) {
        if (isActive) {
          setLoadError({ message: error.message, status: error.status ?? 0 })
          setInstructors([])
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
  }, [accessToken, reloadKey])

  async function handleToggleFeatured(instructor) {
    if (busyId) {
      return
    }

    setActionError('')
    setActionMessage('')
    setBusyId(instructor.id)

    try {
      const updated = await updateInstructor(
        instructor.id,
        buildInstructorPayload({
          ...instructor,
          isFeatured: !instructor.isFeatured,
        }),
        accessToken
      )

      setInstructors((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      )
      setActionMessage(
        updated.isFeatured
          ? `${updated.fullName} is now featured.`
          : `${updated.fullName} is no longer featured.`
      )
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusyId('')
    }
  }

  async function handleDelete(instructorId) {
    await deleteInstructor(instructorId, accessToken)
    setInstructors((current) =>
      current.filter((instructor) => instructor.id !== instructorId)
    )
    setActionError('')
    setActionMessage('Instructor deleted.')
  }

  return (
    <>
      <ManagerHeader onLogout={onLogout} />

      <main className="instructor-management">
        <header className="instructor-management__heading">
          <div className="instructor-management__heading-text">
            <p className="instructor-management__eyebrow">Instructors</p>
            <h1>Instructor directory</h1>
            <p className="instructor-management__subtitle">
              Manage the trainer profiles used by sessions and featured on the
              public homepage.
            </p>
          </div>

          <Link
            className="instructor-management__primary-link"
            to="/manager/instructors/new"
          >
            Create instructor
          </Link>
        </header>

        {actionError && (
          <p className="instructor-management__error" role="alert">
            {actionError}
          </p>
        )}

        {actionMessage && (
          <p className="instructor-management__notice" role="status">
            {actionMessage}
          </p>
        )}

        {isLoading ? (
          <p>Loading instructors…</p>
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
            </button>
          </div>
        ) : instructors.length === 0 ? (
          <div className="instructor-management__empty">
            <p>No instructors have been created yet.</p>
            <Link
              className="instructor-management__secondary-link"
              to="/manager/instructors/new"
            >
              Create the first instructor
            </Link>
          </div>
        ) : (
          <div className="instructor-directory__table-wrapper">
            <table className="instructor-directory__table">
              <caption>{instructors.length} instructors</caption>
              <thead>
                <tr>
                  <th scope="col">Instructor</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor) => (
                  <tr key={instructor.id}>
                    <th scope="row">
                      <span className="instructor-directory__person">
                        {instructor.photoSrc ? (
                          <img
                            className="instructor-directory__photo"
                            src={instructor.photoSrc}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="instructor-directory__photo-placeholder">
                            {initialsOf(instructor) || 'IN'}
                          </span>
                        )}
                        <span>
                          <Link
                            className="instructor-directory__name"
                            to={`/manager/instructors/${instructor.id}`}
                          >
                            {instructor.fullName}
                          </Link>
                        </span>
                      </span>
                    </th>

                    <td>
                      <span
                        className={`instructor-directory__contact${
                          instructor.email
                            ? ''
                            : ' instructor-directory__contact--empty'
                        }`}
                      >
                        {instructor.email || 'Not provided'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`instructor-directory__contact${
                          instructor.phone
                            ? ''
                            : ' instructor-directory__contact--empty'
                        }`}
                      >
                        {instructor.phone || 'Not provided'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`instructor-directory__badge${
                          instructor.isFeatured
                            ? ' instructor-directory__badge--featured'
                            : ''
                        }`}
                      >
                        {instructor.isFeatured ? 'Featured' : 'Not featured'}
                      </span>
                    </td>

                    <td>
                      <div className="instructor-directory__actions">
                        <Link
                          className="instructor-directory__action"
                          to={`/manager/instructors/${instructor.id}`}
                        >
                          View
                        </Link>

                        <Link
                          className="instructor-directory__action"
                          to={`/manager/instructors/${instructor.id}?edit=1`}
                        >
                          Edit
                        </Link>

                        <button
                          className="instructor-directory__action"
                          type="button"
                          onClick={() => handleToggleFeatured(instructor)}
                          disabled={busyId === instructor.id}
                        >
                          {busyId === instructor.id
                            ? 'Saving…'
                            : instructor.isFeatured
                              ? 'Unfeature'
                              : 'Feature'}
                        </button>

                        <button
                          className="instructor-directory__action instructor-directory__action--danger"
                          type="button"
                          onClick={() => setInstructorToDelete(instructor)}
                          disabled={busyId === instructor.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {instructorToDelete && (
          <InstructorDeleteDialog
            instructor={instructorToDelete}
            onClose={() => setInstructorToDelete(null)}
            onConfirm={handleDelete}
          />
        )}
      </main>
    </>
  )
}
