import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/auth'
import './ForgotPasswordPage.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      await requestPasswordReset(email)
      setIsSubmitted(true)
    } catch (requestError) {
      setError(
        requestError.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="forgot-password-page">
      <section
        className="forgot-password-card"
        aria-labelledby="forgot-password-title"
      >
        <h1 id="forgot-password-title">Forgot password?</h1>

        {isSubmitted ? (
          <p role="status">
            If an account exists for that email address, you’ll receive
            password-reset instructions. Please check your inbox and spam
            folder.
          </p>
        ) : (
          <>
            <p>
              Enter your account’s email address to request
              password-reset instructions.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="reset-email">Email address</label>

              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                required
              />

              {error && (
                <p className="forgot-password-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send reset instructions'}
              </button>
            </form>
          </>
        )}
        <p className="forgot-password-card__link">
            <Link to="/login">
            Back to login
            </Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPasswordPage