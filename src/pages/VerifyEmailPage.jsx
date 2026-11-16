import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/auth'
import './ForgotPasswordPage.css'

function VerifyEmailPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  async function handleVerify() {
    if (!token.trim() || isSubmitting || isVerified) return

    setError('')
    setIsSubmitting(true)

    try {
      await verifyEmail(token)

      setIsVerified(true)
      setSearchParams({}, { replace: true })
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not verify your email. Please request a new link.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="forgot-password-page">
      <section
        className="forgot-password-card"
        aria-labelledby="verify-email-title"
      >
        <h1 id="verify-email-title">Verify your email</h1>

        {isVerified ? (
          <>
            <p role="status">
              Your email address has been verified.
              You can now log in.
            </p>

            <Link to="/login">Go to login</Link>
          </>
        ) : !token.trim() ? (
          <>
            <p role="alert">
              This verification link is missing its token.
              Return to login and request a new verification email.
            </p>

            <Link to="/login">Back to login</Link>
          </>
        ) : (
          <>
            <p>
              Click below to verify your email address.
            </p>

            {error && (
              <p className="forgot-password-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying…' : 'Verify email'}
            </button>

            <p>
              If your link has expired, return to login,
              try logging in, and request a new verification email.
            </p>

            <Link to="/login">Back to login</Link>
          </>
        )}
      </section>
    </main>
  )
}

export default VerifyEmailPage