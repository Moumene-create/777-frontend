import { Link } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import './CreateSessionPage.css'
import ManagerHeader from '../components/ManagerHeader'

export default function CreateSessionPage({
  isAuthenticated,
  currentUser,
  onLogout,
  accessToken,
}) {
  return (
     <>
    <ManagerHeader onLogout={onLogout} />

    <main className="create-session">


      <header className="create-session__heading">
        <Link to="/manager">← Session management</Link>
        <h1>Create session</h1>
      </header>

      

      <SessionForm
        accessToken={accessToken} 
      />
    </main>
    </>
  )
}