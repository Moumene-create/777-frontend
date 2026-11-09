import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import { login, getCurrentUser } from '../api/auth'
import './LoginPage.css'

function LoginPage({ onLogin, isAuthenticated, currentUser, onLogout }) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const email = event.target.email.value.trim()
    const normalizedEmail = email.toLowerCase()
    const password = formData.get('password') ?? ''

    if (!email || !password) {
      setError('Please enter your email address and password.')
      return
    }
    setIsSubmitting(true)
    setError('')

    try {
      const tokens = await login({ email, password })
      const user = await getCurrentUser(tokens.access_token)
      onLogin(user, tokens.access_token)
      navigate(user.role === "SESSION_MANAGER" ? '/manager' : '/sessions')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
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
            {error && (
              <p className="auth-form__error" role="alert">
                {error}
              </p>
            )}
            <button
              className="auth-form__submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </div>
      </section>
    </main>
    
  )
}

export default LoginPage