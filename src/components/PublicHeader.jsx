import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo_777_blue.png'
import { useState } from 'react'
import './PublicHeader.css'
function PublicHeader({ isAuthenticated, currentUser, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <header className="public-header">
       <Link className="public-header__logobouton" to="/">
        <img className="public-header__logo" src={logo} alt="Algérie Télécom 7.77" />
      </Link>
    <button
        className="public-header__menu-button"
        type="button"
        aria-label="Open navigation menu"
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
        Menu
        </button>
      <nav
        id="mobile-navigation"
        className={`public-header__actions ${isMenuOpen ? 'public-header__actions--open' : ''}`}
        aria-label="Public navigation"
        >
        <button
          className="public-header__close-button"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMenuOpen(false)}
        >
          ×
        </button>
        
          
      <NavLink
        className={({ isActive }) =>
          `public-header__login ${isActive ? 'public-header__signup' : ''}`
        }
        to="/"
        end
      >
        Home
      </NavLink>

      <NavLink
        className={({ isActive }) =>
          `public-header__login ${isActive ? 'public-header__signup' : ''}`
        }
        to="/sessions"
      >
        Sessions
      </NavLink>

      {isAuthenticated ? (
        <>
          <NavLink
            className={({ isActive }) =>
              `public-header__login ${isActive ? 'public-header__signup' : ''}`
            }
            to="/my-sessions"
          >
            My sessions
          </NavLink>

          <button
            type="button"
            className="public-header__login"
            onClick={onLogout}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <NavLink
            className={({ isActive }) =>
              `public-header__login ${isActive ? 'public-header__signup' : ''}`
            }
            to="/login"
          >
            Log in
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `public-header__login ${isActive ? 'public-header__signup' : ''}`
            }
            to="/signup"
          >
            Create account
          </NavLink>
        </>
      )}
        
      </nav>

    </header>
  )
}

export default PublicHeader