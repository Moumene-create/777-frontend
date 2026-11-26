import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import './NotFoundPage.css'

export default function NotFoundPage({
  isAuthenticated = false,
  currentUser = null,
  onLogout,
}) {
  return (
    <main className="not-found">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <section className="not-found__card">
        <p className="not-found__code">404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>

        <div className="not-found__actions">
          <Link to="/">Back to home</Link>
          <Link to="/sessions">Browse sessions</Link>
        </div>
      </section>
    </main>
  )
}
