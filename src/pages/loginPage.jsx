import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import './LoginPage.css'

function LoginPage({ onLogin, isAuthenticated, currentUser, onLogout }) {
  const navigate = useNavigate()

function handleSubmit(event) {
  event.preventDefault()

  const email = event.target.email.value.trim()

  const isMockManager =
    import.meta.env.DEV &&
    email.toLowerCase() === 'manager@example.com'

  const user = {
    name: isMockManager ? 'Session Manager' : 'Participant',
    email,
    ageCategory: '18-23',
    roles: isMockManager
      ? ['PARTICIPANT', 'SESSION_MANAGER']
      : ['PARTICIPANT'],
  }

  onLogin(user)

  navigate(isMockManager ? '/manager' : '/sessions', {
    replace: true,
  })
}

  return (
    <main className="auth-page">
      <PublicHeader
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <section className="auth-page__section">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Log in</h1>
            <p>Access your 7.77 Training Platform account.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            <button className="auth-form__submit" type="submit">
              Log in
            </button>
          </form>
        </div>
      </section>
    </main>
    
  )
}

export default LoginPage