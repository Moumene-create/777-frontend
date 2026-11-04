import { Link } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import './CreateSessionPage.css'

export default function CreateSessionPage({
  isAuthenticated,
  currentUser,
  onLogout,
}) {
  return (
    <main className="create-session">


      <header className="create-session__heading">
        <Link to="/manager">← Session management</Link>
        <h1>Create session</h1>
      </header>

      

      <SessionForm />
    </main>
  )
}