import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import ChangePasswordForm from '../components/ChangePasswordForm'
import './ChangePasswordPage.css'

export default function ChangePasswordPage({
  isAuthenticated,
  currentUser,
  onLogout,
  accessToken,
}) {
  return (
    <main className="change-password-page">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <section className="change-password-page__card">
        <Link className="change-password-page__back" to="/profile">
          ← Back to profile
        </Link>

        <h1>Change password</h1>

        <p>
          Enter your current password, then choose a new one of at least 8
          characters.
        </p>

        <ChangePasswordForm accessToken={accessToken} />
      </section>
    </main>
  )
}
