import { Link } from 'react-router-dom'
import logo from '../assets/logo_777_blue.png'
import './PublicFooter.css'

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__content">
        <div className="public-footer__brand">
          <Link className="public-footer__logo-link" to="/" aria-label="Go to home">
            <img
              className="public-footer__logo"
              src={logo}
              alt="Algérie Télécom 7.77"
            />
          </Link>

          <p>
            A platform for discovering and joining training sessions for every
            stage of life.
          </p>
        </div>

        <nav className="public-footer__navigation" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/sessions">Sessions</Link>
          <Link to="/about">About us</Link>
          <Link to="/login">Log in</Link>
        </nav>
      </div>

      <div className="public-footer__bottom">
        <p>© {new Date().getFullYear()} Algérie Télécom. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default PublicFooter