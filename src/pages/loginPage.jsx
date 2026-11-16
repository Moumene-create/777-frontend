import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import { login, getCurrentUser, resendVerificationEmail, } from '../api/auth'
import { Link } from 'react-router-dom'
import './LoginPage.css'

function LoginPage({ onLogin, isAuthenticated, currentUser, onLogout }) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationError, setVerificationError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting || isResending) return
    setUnverifiedEmail('')
    setVerificationMessage('')
    setVerificationError('')
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
      onLogin(user, tokens.access_token, tokens.refresh_token)
      navigate(user.role === "SESSION_MANAGER" ? '/manager' : '/sessions')
    } catch (requestError) {
      setError(requestError.message)

      if (requestError.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email)
      }
    } finally {
      setIsSubmitting(false)
    }
}

  async function handleResendVerification() {
    if (!unverifiedEmail || isResending || isSubmitting) return

    setIsResending(true)
    setVerificationMessage('')
    setVerificationError('')

    try {
      await resendVerificationEmail(unverifiedEmail)

      setVerificationMessage(
        'Verification email requested. Check your inbox and spam folder, ' +
        'open the verification link, then return here to log in.'
      )
    } catch (requestError) {
      setVerificationError(
        requestError.message ||
          'Could not resend the verification email. Please try again.'
      )
    } finally {
      setIsResending(false)
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
          {unverifiedEmail && (
            <section aria-label="Email verification">
              <p>
                Verification is required for {unverifiedEmail}.
              </p>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending || isSubmitting}
              >
                {isResending
                  ? 'Sending…'
                  : 'Resend verification email'}
              </button>

              {verificationMessage && (
                <p role="status">{verificationMessage}</p>
              )}

              {verificationError && (
                <p role="alert">{verificationError}</p>
              )}
            </section>
          )}
          <p className="auth-card__forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </section>
    </main>
    
  )
}

export default LoginPage