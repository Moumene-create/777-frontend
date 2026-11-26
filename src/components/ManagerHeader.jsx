import { NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import './ManagerHeader.css'

export default function ManagerHeader({ onLogout }) {
  const navigate = useNavigate()

  function handleLogout() {
    onLogout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="manager-header">
      <div className="manager-header__inner">
        <NavLink to="/manager" className="manager-header__brand">
          7.77 · Manager workspace
        </NavLink>

        <nav
          className="manager-header__nav"
          aria-label="Manager navigation"
        >
          <NavLink to="/manager" end>
            Manage sessions
          </NavLink>

          <NavLink to="/manager/instructors">
            Instructors
          </NavLink>

          <NavLink to="/profile">
            Profile
          </NavLink>

          <ThemeToggle inline />

          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </div>
    </header>
  )
}