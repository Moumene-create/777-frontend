import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'
import './ForgotPasswordPage.css'

function ResetPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || !token.trim()) return

    setError('')

    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({ token, newPassword })

      setNewPassword('')
      setConfirmPassword('')
      setIsComplete(true)

      setSearchParams({}, { replace: true })
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not reset your password. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="forgot-password-page">
      <section
        className="forgot-password-card"
        aria-labelledby="reset-password-title"
      >
        <h1 id="reset-password-title">Reset password</h1>

        {isComplete ? (
          <>
            <p role="status">
              Your password has been reset. You can now log in
              with your new password.
            </p>

            <Link to="/login">Back to login</Link>
          </>
        ) : !token.trim() ? (
          <>
            <p role="alert">
              This reset link is missing its token.
              Please request a new link.
            </p>

            <Link to="/forgot-password">
              Request a new reset link
            </Link>
          </>
        ) : (
          <>
            <p>Choose a new password for your account.</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="new-password">New password</label>

              <input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                disabled={isSubmitting}
                required
              />

              <label htmlFor="confirm-password">
                Confirm new password
              </label>

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                disabled={isSubmitting}
                required
              />

              {error && (
                <p className="forgot-password-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting…' : 'Reset password'}
              </button>
            </form>

            <p>
              <Link to="/forgot-password">
                Request a new reset link
              </Link>
            </p>

            <Link to="/login">Back to login</Link>
          </>
        )}
      </section>
    </main>
  )
}

export default ResetPasswordPage