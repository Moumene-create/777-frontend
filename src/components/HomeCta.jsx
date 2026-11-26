import { Link } from 'react-router-dom'
import './HomeCta.css'

function HomeCta({ isAuthenticated = false, currentUser = null }) {
  const isManager = isAuthenticated && currentUser?.role === 'SESSION_MANAGER'

  let eyebrow = 'Start your journey'
  let title = 'Ready to join your next training session?'
  let description =
    'Create your account to discover training sessions available for your age category.'
  let destination = '/sessions'
  let actionLabel = 'Browse training sessions'

  if (isManager) {
    eyebrow = 'Manager workspace'
    title = 'Manage your next training session'
    description =
      'Create sessions, follow registrations and validate attendance from one place.'
    destination = '/manager'
    actionLabel = 'Open the manager workspace'
  } else if (isAuthenticated) {
    eyebrow = 'Your next session'
    description =
      'Browse the sessions available for your age category and register in a few clicks.'
  }

  return (
    <section className="home-cta" aria-labelledby="home-cta-title">
      <div className="home-cta__content">
        <p className="home-cta__eyebrow">{eyebrow}</p>

        <h2 id="home-cta-title">{title}</h2>

        <p>{description}</p>

        <div className="home-cta__actions">
          {isAuthenticated ? (
            <Link className="home-cta__primary-link" to={destination}>
              {actionLabel}
            </Link>
          ) : (
            <>
              <Link className="home-cta__primary-link" to="/signup">
                Create an account
              </Link>

              <Link className="home-cta__secondary-link" to="/login">
                I already have an account
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default HomeCta
