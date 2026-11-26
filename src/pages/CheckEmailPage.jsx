import { Link } from 'react-router-dom'
import './ForgotPasswordPage.css'

function CheckEmailPage() {
  return (
    <main className="forgot-password-page">
      <section
        className="forgot-password-card"
        aria-labelledby="check-email-title"
      >
        <h1 id="check-email-title">Check your email</h1>

        <p>Your account has been created.</p>

        <p>
          A verification email should arrive shortly.
          Open it and follow the link to verify your email address
          before logging in.
        </p>

        <p>
          If you cannot find it, check your spam folder.
          You can also return to login, attempt to log in,
          and request a new verification email.
        </p>

        <Link to="/login">Go to login</Link>
      </section>
    </main>
  )
}

export default CheckEmailPage