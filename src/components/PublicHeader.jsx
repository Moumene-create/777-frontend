import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo_777_black.png'
import ThemeToggle from './ThemeToggle'
import './PublicHeader.css'

const MOBILE_MEDIA_QUERY = '(max-width: 48rem)'

function PublicHeader({
  isAuthenticated,
  currentUser,
  onLogout,
  overlay = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const isManager =
    isAuthenticated && currentUser?.role === 'SESSION_MANAGER'

  function closeMenu() {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)

    function handleBreakpointChange(event) {
      if (!event.matches) {
        setIsMenuOpen(false)
      }
    }

    mediaQuery.addEventListener('change', handleBreakpointChange)

    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  function handleLogoutClick() {
    closeMenu()
    onLogout()
    navigate('/')
  }

  function linkClassName({ isActive }) {
    return `public-header__link${isActive ? ' public-header__link--active' : ''}`
  }

  return (
    <>
      <header
        className={`public-header${
          overlay ? ' public-header--overlay' : ''
        }`}
      >
        {isMenuOpen && (
          <button
            type="button"
            className="public-header__backdrop"
            aria-label="Close navigation menu"
            tabIndex={-1}
            onClick={closeMenu}
          />
        )}

        <div className="public-header__inner">
          <Link
            className="public-header__logobouton"
            to="/"
            onClick={closeMenu}
          >
            <img
              className="public-header__logo"
              src={logo}
              alt="Algérie Télécom 7.77"
            />
          </Link>

          <button
            className="public-header__menu-button"
            type="button"
            aria-label={
              isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className="public-header__menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <nav
            id="mobile-navigation"
            className={`public-header__actions ${
              isMenuOpen ? 'public-header__actions--open' : ''
            }`}
            aria-label="Public navigation"
          >
            <button
              className="public-header__close-button"
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMenu}
            >
              ×
            </button>

            <NavLink className={linkClassName} to="/" end onClick={closeMenu}>
              Home
            </NavLink>

            {!isManager && (
              <NavLink
                className={linkClassName}
                to="/sessions"
                onClick={closeMenu}
              >
                Sessions
              </NavLink>
            )}

            <ThemeToggle inline />

            {isAuthenticated ? (
              <>
                {!isManager && (
                  <NavLink
                    className={linkClassName}
                    to="/my-sessions"
                    onClick={closeMenu}
                  >
                    My sessions
                  </NavLink>
                )}

                <NavLink
                  className={linkClassName}
                  to="/profile"
                  onClick={closeMenu}
                >
                  Profile
                </NavLink>

                {isManager && (
                  <NavLink
                    className={linkClassName}
                    to="/manager"
                    onClick={closeMenu}
                  >
                    Manager workspace
                  </NavLink>
                )}

                <button
                  type="button"
                  className="public-header__link public-header__logout"
                  onClick={handleLogoutClick}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  className={linkClassName}
                  to="/login"
                  onClick={closeMenu}
                >
                  Log in
                </NavLink>

                <NavLink
                  className="public-header__cta"
                  to="/signup"
                  onClick={closeMenu}
                >
                  Create account
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      {!overlay && (
        <div className="public-header__spacer" aria-hidden="true" />
      )}
    </>
  )
}

export default PublicHeader
