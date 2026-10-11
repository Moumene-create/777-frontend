import { Link } from 'react-router-dom'
import './HomeCta.css'

function HomeCta() {
  return (
    <section className="home-cta" aria-labelledby="home-cta-title">
      <div className="home-cta__content">
        <p className="home-cta__eyebrow">Start your journey</p>

        <h2 id="home-cta-title">
          Ready to join your next training session?
        </h2>

        <p>
          Create your account to discover training sessions available for your
          age category.
        </p>

        <div className="home-cta__actions">
          <Link className="home-cta__primary-link" to="/signup">
            Create an account
          </Link>

          <Link className="home-cta__secondary-link" to="/login">
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HomeCta