import { Link, useNavigate } from 'react-router-dom'
import ManagerHeader from '../components/ManagerHeader'
import InstructorForm from '../components/InstructorForm'
import { createInstructor } from '../api/instructors'
import './InstructorManagement.css'

export default function CreateInstructorPage({ accessToken, onLogout }) {
  const navigate = useNavigate()

  async function handleCreate(payload) {
    return createInstructor(payload, accessToken)
  }

  function handleSaved(instructor) {
    navigate(`/manager/instructors/${instructor.id}`, { replace: true })
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
            <p className="instructor-management__eyebrow">Instructors</p>
            <h1>Create instructor</h1>
            <p className="instructor-management__subtitle">
              Add a trainer profile. A photo can be uploaded after the
              profile is created.
            </p>
          </div>
        </header>

        <section className="instructor-management__form-card">
          <InstructorForm
            mode="create"
            accessToken={accessToken}
            onSubmit={handleCreate}
            onSaved={handleSaved}
            cancelTo="/manager/instructors"
          />
        </section>
      </main>
    </>
  )
}
